"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const zod_1 = require("zod");
const demo_1 = require("../src/auth/demo");
const database_1 = require("../src/database");
const shared_1 = require("@legalitt/shared");
const case_state_machine_1 = require("../src/cases/case-state-machine");
const payments_service_1 = require("../src/payments/payments.service");
const simulated_payments_1 = require("../src/payments/simulated-payments");
const in_app_notifications_1 = require("../src/notifications/in-app-notifications");
const simulated_notifications_1 = require("../src/notifications/simulated-notifications");
const seed_notices_1 = require("./seed-notices");
// Design 437's advocate card, value for value. bar_council_state is not drawn
// anywhere, so it is not invented.
const demoAdvocateProfile = {
    years_experience: 8,
    practice_areas: ["Property Law"],
    bar_council_number: "D/1842/2016",
    enrolment_year: 2016,
    rating_avg: "4.9",
    rating_count: 142,
    verification: "approved",
    verified_at: new Date("2026-05-01T00:00:00Z"),
    city: "Indore",
    state: "Madhya Pradesh",
    photo_key: "advocate-05",
    // Design 433's About and Professional Details. Its "Rahul Sharma" is a
    // placeholder name (question 9, closed), so the bio names this advocate.
    bio: "Adv. Arjun Sharma is an experienced legal professional with expertise in civil, criminal, and property matters. He focuses on providing clear legal guidance and professional representation tailored to each client's needs.",
    education: "LL.B., LL.M.",
    courts: ["District Court", "High Court"],
    languages: ["Hindi", "English"],
};
// Synthetic development accounts authorised for testing the multi-row picker.
// No portraits, ratings, credentials or personal contact numbers are invented.
const extraAdvocates = [
    { role: 'advocate', email: 'demo-advocate-2@legalitt.invalid', name: 'Demo Advocate Asha', practice_areas: ['Consumer Law'], city: 'Mumbai', load: 0 },
    { role: 'advocate', email: 'demo-advocate-3@legalitt.invalid', name: 'Demo Advocate Kabir', practice_areas: ['Family Law', 'Civil Law'], city: 'Jaipur', load: 1 },
    { role: 'advocate', email: 'demo-advocate-4@legalitt.invalid', name: 'Demo Advocate Meera', practice_areas: ['Property Law', 'Tenancy'], city: 'Pune', load: 3 },
];
// Owner-approved permanent second client for bidirectional access-control checks.
const isolationClient = { role: 'client', email: 'demo-client-isolation@legalitt.invalid', name: 'TEST ONLY Client Isolation' };
// Explicit operator command, never run by a request handler or in production.
async function main() {
    (0, demo_1.requireDemoMode)();
    const args = process.argv.slice(2);
    if (args.some(arg => arg !== '--client-isolation-only') || args.length > 1)
        throw new Error('Usage: seed-demo.js [--client-isolation-only]');
    const isolationOnly = args.includes('--client-isolation-only');
    if (!process.env.AUTH_CONFIG_SECRET_ARN)
        throw new Error("Auth configuration required");
    const secrets = new client_secrets_manager_1.SecretsManagerClient({ region: "ap-south-1" });
    const cognito = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({ region: "ap-south-1" });
    const db = await (0, database_1.createDatabaseClient)();
    try {
        const config = await secrets.send(new client_secrets_manager_1.GetSecretValueCommand({
            SecretId: process.env.AUTH_CONFIG_SECRET_ARN,
        }));
        const { userPoolId } = zod_1.z
            .object({ userPoolId: zod_1.z.string().startsWith("ap-south-1_") })
            .parse(JSON.parse(config.SecretString ?? "{}"));
        const pool = await cognito.send(new client_cognito_identity_provider_1.DescribeUserPoolCommand({ UserPoolId: userPoolId }));
        if (pool.UserPool?.UserPoolTags?.environment !== "dev")
            throw new Error("Demo accounts require a dev-tagged pool");
        const password = await (0, demo_1.demoPassword)();
        const accounts = isolationOnly ? [isolationClient] : [...Object.entries({ ...demo_1.demoAccounts, admin: { email: "demo-admin@legalitt.invalid", name: "Demo admin" } }).map(([role, account]) => ({ role, ...account })), ...extraAdvocates, isolationClient];
        for (const account of accounts) {
            const { role } = account;
            const target = { UserPoolId: userPoolId, Username: account.email };
            try {
                await cognito.send(new client_cognito_identity_provider_1.AdminCreateUserCommand({
                    ...target,
                    MessageAction: "SUPPRESS",
                    UserAttributes: [
                        { Name: "email", Value: account.email },
                        { Name: "email_verified", Value: "true" },
                        { Name: "name", Value: account.name },
                        { Name: "custom:role", Value: role },
                    ],
                }));
            }
            catch (error) {
                if (error.name !== "UsernameExistsException")
                    throw error;
            }
            const user = await cognito.send(new client_cognito_identity_provider_1.AdminGetUserCommand(target));
            const attributes = Object.fromEntries((user.UserAttributes ?? []).map((a) => [a.Name, a.Value]));
            if (attributes["custom:role"] !== role ||
                attributes.email !== account.email ||
                attributes.email_verified !== "true" ||
                attributes.phone_number ||
                !attributes.sub) {
                throw new Error("Existing demo account does not match the specification");
            }
            // The scoped setup never resets an existing confirmed credential. A user
            // left unconfirmed by an interrupted first run can finish provisioning.
            // Full seeding retains the explicit password-maintenance workflow.
            if (!isolationOnly || user.UserStatus === 'FORCE_CHANGE_PASSWORD')
                await cognito.send(new client_cognito_identity_provider_1.AdminSetUserPasswordCommand({
                    ...target,
                    Password: password,
                    Permanent: true,
                }));
            const row = await db.user.upsert({
                where: { cognito_sub: attributes.sub },
                create: {
                    cognito_sub: attributes.sub,
                    full_name: account.name,
                    email: account.email,
                    email_verified: true,
                    role: role,
                },
                update: { full_name: account.name },
            });
            // Dev seed data only, behind the same guards as the accounts (§9.1): the
            // facts design 437 draws for its advocate. A seeded 4.9 from 142 reviews
            // must never reach a production stage.
            if (role === "advocate" && account.email === demo_1.demoAccounts.advocate.email)
                await db.advocateProfile.upsert({
                    where: { user_id: row.id },
                    create: { user_id: row.id, ...demoAdvocateProfile },
                    update: demoAdvocateProfile,
                });
            const extra = extraAdvocates.find(a => a.email === account.email);
            if (extra) {
                const profile = { verification: 'approved', practice_areas: extra.practice_areas, city: extra.city };
                await db.advocateProfile.upsert({ where: { user_id: row.id }, create: { user_id: row.id, ...profile }, update: profile });
            }
        }
        if (!isolationOnly)
            await seedNotices(db);
        await seedIsolationCase(db);
        console.log(isolationOnly
            ? "Seeded the isolation client and its own case; existing confirmed credentials unchanged; no mail or SMS sent."
            : "Seeded seven dev accounts and idempotent demo workload cases; no mail or SMS sent.");
    }
    finally {
        secrets.destroy();
        cognito.destroy();
        await db.$disconnect();
    }
}
async function seedIsolationCase(db) {
    const seedKey = 'client-isolation-legal-notice';
    const client = await db.user.findUniqueOrThrow({ where: { email: isolationClient.email } });
    if (client.role !== 'client' || client.status !== 'active')
        throw new Error('Isolation client must be active');
    const tag = await db.caseEvent.findFirst({ where: { type: 'development_seed', payload: { path: ['seed_key'], equals: seedKey } } });
    if (tag) {
        const existing = await db.case.findUniqueOrThrow({ where: { id: tag.case_id } });
        if (existing.client_id !== client.id || existing.service_code !== 'legal_notice')
            throw new Error('Isolation seed owner mismatch');
        console.log(`Isolation case: ${existing.reference} (${existing.id}), preserved`);
        return;
    }
    const prisma = { getClient: async () => db };
    const state = new case_state_machine_1.CaseStateMachine(prisma, new in_app_notifications_1.InAppNotifications(new simulated_notifications_1.SimulatedNotifications()));
    const record = await state.create({ id: client.id, role: 'client', source: 'simulated' }, {
        service_code: 'legal_notice', tier: 'ordinary', details: { client: { fullName: isolationClient.name } },
    });
    await (0, case_state_machine_1.tagDevelopmentSeed)(db, record.id, seedKey);
    console.log(`Isolation case: ${record.reference} (${record.id}), created`);
}
// Every seeded case goes through the real path a client's case takes: create,
// intake, subject, submit (with its validation and pricing), simulated payment,
// then the admin's assignment and the advocate's acceptance. A rerun resumes a
// case from where it stands. Cases seeded before this path existed are completed
// in place once (repairDevelopmentSeed) instead of being recreated.
async function seedNotices(db) {
    const prisma = { getClient: async () => db };
    const notifications = new in_app_notifications_1.InAppNotifications(new simulated_notifications_1.SimulatedNotifications());
    const state = new case_state_machine_1.CaseStateMachine(prisma, notifications);
    const payments = new payments_service_1.PaymentsService(prisma, state, new simulated_payments_1.SimulatedPayments(), notifications);
    const actor = async (email, role) => ({ id: (await db.user.findUniqueOrThrow({ where: { email } })).id, role, source: "simulated" });
    const client = await actor(demo_1.demoAccounts.client.email, "client");
    const admin = await actor("demo-admin@legalitt.invalid", "admin");
    const pricingIdForTier = async (tier) => (await db.servicePricing.findFirstOrThrow({
        where: { service_code: "legal_notice", tier, variant: null, effective_to: null }, orderBy: { effective_from: "desc" }
    })).id;
    const summary = [];
    for (const seed of seed_notices_1.SEED_NOTICES) {
        const tag = await db.caseEvent.findFirst({ where: { type: "development_seed", payload: { path: ["seed_key"], equals: seed.key } } });
        const advocate = seed.advocateEmail ? await actor(seed.advocateEmail, "advocate") : undefined;
        let id = tag?.case_id;
        if (id) {
            const repaired = await (0, case_state_machine_1.repairDevelopmentSeed)(db, { seedKey: seed.key, intake: seed.intake, pricingIdForTier });
            if (repaired === "repaired" || repaired === "already") {
                const changed = await (0, case_state_machine_1.syncDevelopmentSeedSender)(db, seed.key, seed.intake.sender);
                summary.push(`${seed.key}: ${repaired}${changed.length ? ` (sender ${changed.join(", ")})` : ""}`);
                continue;
            }
        }
        else {
            id = (await state.create(client, { service_code: "legal_notice", tier: seed.intake.tier })).id;
            await (0, case_state_machine_1.tagDevelopmentSeed)(db, id, seed.key);
        }
        const { intake } = seed;
        const status = async () => (await db.case.findUniqueOrThrow({ where: { id }, select: { status: true } })).status;
        if ((await status()) === shared_1.CaseStatus.draft) {
            const record = await state.updateDraft(client, id, { tier: intake.tier, details: intake.details,
                subject_matter: intake.subject_matter, legal_demand: intake.legal_demand, sender: intake.sender });
            await state.recordIntakeAi(client, id, { matter_type: record.matter_type, subject_matter: intake.subject_matter }, { task: "subject", text: intake.subject_line, simulated: true });
            await state.submitForPayment(client, id);
        }
        if ((await status()) === shared_1.CaseStatus.payment_pending)
            await payments.intent(client, { case_id: id, purpose: "service_fee" }, `development-seed:${seed.key}:service_fee`);
        if (advocate) {
            if ((await status()) === shared_1.CaseStatus.paid)
                await state.assign(admin, id, { advocate_id: advocate.id });
            if ((await status()) === shared_1.CaseStatus.assigned)
                await state.transition(advocate, id, shared_1.CaseStatus.advocate_accepted);
            if ((await status()) === shared_1.CaseStatus.advocate_accepted)
                await state.startDrafting(advocate, id);
        }
        const changed = await (0, case_state_machine_1.syncDevelopmentSeedSender)(db, seed.key, intake.sender);
        summary.push(`${seed.key}: ${await status()}${changed.length ? ` (sender ${changed.join(", ")})` : ""}`);
    }
    console.log("Seed notices: " + summary.join("; "));
}
main().catch(() => {
    console.error("Demo seed failed; check dev configuration and permissions.");
    process.exitCode = 1;
});
