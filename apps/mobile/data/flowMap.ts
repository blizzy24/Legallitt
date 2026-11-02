// DEMO ONLY (constants/dev.ts DEMO_AUTO_ADVANCE). The route each screen
// leads to when its primary control is static, disabled or waiting.
//
// Generated from the design numbers in each route file's header: within a
// section, design/N leads to the next-numbered design. Branches are mapped by
// hand where the designs draw them (marked). Patterns with [param] match any
// value; the target keeps the same param when it has one.

/** A screen with no next screen (a terminal or placeholder page). */
export const TERMINAL = '';

export const FLOW_MAP: Record<string, string> = {
  // ── routes with no design number (data/flowMap.ts, demo part 2) ──
  // Each mapped to what the screen itself leads to; TERMINAL where nothing follows.
  '/': '/onboarding', // splash → onboarding
  '/role': '/dashboard', // role picker → the advocate dashboard (client: /home)
  '/advocate/consultation/[id]/video': '/advocate/consultation/[id]/end', // End Call
  '/advocate/requests/[id]': '/advocate/requests/[id]/confirmed', // accept → confirmed
  '/cases': '/cases/all', // the client cases tab → View All
  '/cases/all': '/cases/[id]', // a case card
  '/cases/[id]': '/documents/case', // the case's documents
  '/earnings': '/advocate/wallet/withdraw', // Withdraw Money
  '/fir/info': '/fir/step1', // Start
  '/hearings': '/hearings/[id]', // a hearing card
  '/hearings/[id]': '/cases/[id]', // its case
  '/property-search/request': '/property-search/review', // Continue
  '/services': '/legal-notice', // the first service tile
  '/services/district-court/case-details': '/services/district-court/documents', // Continue
  '/services/district-court/documents': '/services/district-court/pricing', // Continue
  '/services/district-court/documents-needed': '/services/district-court/courier/details', // Send documents
  '/services/district-court/review': '/services/district-court/payment', // 344's Send Request → the service-fee payment
  // ── advocate/ai ──
  // last: /advocate/ai (171)
  // ── advocate/analytics ──
  '/advocate/analytics': '/advocate/analytics/performance', // 268 → 269
  // last: /advocate/analytics/performance (269)
  // ── advocate/availability ──
  // last: /advocate/availability (149)
  // ── advocate/calendar ──
  '/advocate/calendar': '/advocate/calendar/add-hearing', // 271 → 272
  '/advocate/calendar/add-hearing': '/advocate/calendar/[id]', // 272 → 273
  '/advocate/calendar/[id]': '/advocate/calendar/availability', // 273 → 274
  // last: /advocate/calendar/availability (274)
  // ── advocate/clients ──
  '/advocate/clients/[id]': '/advocate/clients/[id]/cases', // 152 → 153
  '/advocate/clients/[id]/cases': '/advocate/clients/[id]/documents', // 153 → 154
  '/advocate/clients/[id]/documents': '/advocate/clients/[id]/messages', // 154 → 155
  '/advocate/clients/[id]/messages': '/advocate/clients/[id]/payments', // 155 → 156
  '/advocate/clients/[id]/payments': '/advocate/clients/[id]/payments/[paymentId]', // 156 → 157
  '/advocate/clients/[id]/payments/[paymentId]': '/advocate/clients/empty', // 157 → 158
  '/advocate/clients/empty': '/advocate/clients/search', // 158 → 159
  // last: /advocate/clients/search (159)
  // ── advocate/consultation ──
  '/advocate/consultation/[id]/room': '/advocate/consultation/[id]/chat', // 167 → 169
  '/advocate/consultation/[id]/chat': '/advocate/consultation/[id]/paused', // 169 → 175
  '/advocate/consultation/[id]/paused': '/advocate/consultation/[id]/reschedule', // 175 → 176
  '/advocate/consultation/[id]/reschedule': '/advocate/consultation/[id]/end', // 176 → 179
  '/advocate/consultation/[id]/end': '/advocate/consultation/[id]/docket', // 179 → 180
  '/advocate/consultation/[id]/docket': '/advocate/consultation/[id]/completed', // 180 → 181
  '/advocate/consultation/[id]/completed': '/advocate/consultation/[id]/report', // 181 → 288
  // last: /advocate/consultation/[id]/report (288)
  // ── advocate/courier ──
  '/advocate/courier/confirm': '/advocate/courier/received', // 282 → 283
  // last: /advocate/courier/received (283)
  // ── advocate/court ──
  '/advocate/court/request': '/advocate/court/ai-summary', // 363 → 364
  '/advocate/court/ai-summary': '/advocate/court/chat', // 364 → 365
  '/advocate/court/chat': '/advocate/court/copilot', // 365 → 366
  '/advocate/court/copilot': '/advocate/court/call', // 366 → 369
  '/advocate/court/call': '/advocate/court/waiting-client', // 369 → 370
  '/advocate/court/waiting-client': '/advocate/court/client-accepted', // 370 → 371
  '/advocate/court/client-accepted': '/advocate/court/recommend-documents', // 371 → 374 (drawn branch)
  '/advocate/court/client-accepted-2': '/advocate/court/recommend-documents', // 372 → 374 (drawn branch)
  '/advocate/court/client-declined': '/dashboard', // 373 is a terminal branch
  '/advocate/court/recommend-documents': '/advocate/court/confirm-documents', // 374 → 375
  '/advocate/court/confirm-documents': '/advocate/court/documents-received', // 375 → 376
  '/advocate/court/documents-received': '/advocate/court/case-preparation', // 376 → 377
  '/advocate/court/case-preparation': '/advocate/court/court-fee/create', // 377 → 380: 383's drawn Continue leads on to 378
  '/advocate/court/court-filing': '/advocate/court/confirm-filing', // 378 → 379
  '/advocate/court/confirm-filing': '/advocate/court/court-fee/create', // 379 → 380
  '/advocate/court/court-fee/create': '/advocate/court/court-fee/sent', // 380 → 381
  '/advocate/court/court-fee/sent': '/advocate/court/pre-filing-review', // 381 → 382
  '/advocate/court/pre-filing-review': '/advocate/court/client-approved', // 382 → 383
  '/advocate/court/client-approved': '/advocate/court/case-filed', // 383 → 384
  '/advocate/court/case-filed': '/advocate/court/process-fee/create', // 384 → 385
  '/advocate/court/process-fee/create': '/advocate/court/process-fee/done', // 385 → 386
  '/advocate/court/process-fee/done': '/advocate/court/hearing/add', // 386 → 387
  '/advocate/court/hearing/add': '/advocate/court/hearing/scheduled', // 387 → 388
  '/advocate/court/hearing/scheduled': '/advocate/court/hearing/live', // 388 → 389
  '/advocate/court/hearing/live': '/advocate/court/hearing/update', // 389 → 390
  '/advocate/court/hearing/update': '/advocate/court/hearing/review-update', // 390 → 391
  '/advocate/court/hearing/review-update': '/advocate/court/hearing/next', // 391 → 392
  '/advocate/court/hearing/next': '/advocate/court/change-advocate', // 392 → 393
  '/advocate/court/change-advocate': '/advocate/court/change-advocate-noc', // 393 → 394
  '/advocate/court/change-advocate-noc': '/advocate/court/completed', // 394 → 395
  '/advocate/court/completed': '/advocate/court/dashboard', // 395 → 396
  '/advocate/court/dc/request': '/advocate/court/dc/client-documents', // 398 → 399
  // last: /advocate/court/dc/client-documents (399)
  // ── advocate/documents ──
  // last: /advocate/documents/viewer (261)
  // ── advocate/fir ──
  '/advocate/fir/[id]': '/advocate/fir/documents', // 215 → 216
  '/advocate/fir/documents': '/advocate/fir/generator', // 216 → 217
  '/advocate/fir/generator': '/advocate/fir/draft', // 217 → 218
  '/advocate/fir/draft': '/advocate/fir/review', // 218 → 219
  '/advocate/fir/review': '/advocate/fir/review-compact', // 219/448 → 449, Waiting only
  '/advocate/fir/review-compact': '/advocate/fir/completed', // demo external approval → 450/220
  '/advocate/fir/completed': TERMINAL, // 220/450; must not match /advocate/fir/[id]
  // ── advocate/forensic ──
  '/advocate/forensic/requests': '/advocate/forensic/[id]', // 222 → 223
  '/advocate/forensic/[id]': '/advocate/forensic/documents', // 223 → 224
  '/advocate/forensic/documents': '/advocate/forensic/waiting', // 224 → 225
  '/advocate/forensic/waiting': '/advocate/forensic/report', // 225 → 226
  '/advocate/forensic/report': '/advocate/forensic/affidavit', // 226 → 227
  '/advocate/forensic/affidavit': '/advocate/forensic/submit', // 227 → 228
  '/advocate/forensic/submit': '/advocate/forensic/admin-review', // 228 → 229
  '/advocate/forensic/admin-review': '/advocate/forensic/admin-approved', // 229 → 230
  '/advocate/forensic/admin-approved': '/advocate/forensic/admin-changes', // 230 → 231
  '/advocate/forensic/admin-changes': '/advocate/forensic/paid', // 231 → 232
  // last: /advocate/forensic/paid (232)
  // ── advocate/notice ──
  '/advocate/notice/[id]/fee': '/advocate/notice/[id]/documents', // 185 → 186
  '/advocate/notice/[id]/documents': '/advocate/notice/[id]/drafting', // 186 → 187
  '/advocate/notice/[id]/drafting': '/advocate/notice/[id]/draft', // 187 → 188
  '/advocate/notice/[id]/draft': '/advocate/notice/[id]/response', // 188 → 189
  '/advocate/notice/[id]/response': '/advocate/notice/[id]/review', // 189 → 191
  '/advocate/notice/[id]/review': '/advocate/notice/[id]/final', // 191 → 192
  '/advocate/notice/[id]/final': '/advocate/notice/[id]/dispatch', // 192 → 193
  '/advocate/notice/[id]/dispatch': '/advocate/notice/[id]/send', // 193 → 194
  '/advocate/notice/[id]/send': '/advocate/notice/[id]/delivery', // 194 → 195
  '/advocate/notice/[id]/delivery': '/advocate/notice/[id]/payment', // 195 → 196
  '/advocate/notice/[id]/payment': '/advocate/notice/[id]/scan-pay', // 196 → 197
  '/advocate/notice/[id]/scan-pay': '/advocate/notice/[id]/paid', // 197 → 198
  '/advocate/notice/[id]/paid': '/advocate/notice/[id]/shipment', // 198 → 199
  '/advocate/notice/[id]/shipment': '/advocate/notice/[id]/tracking', // 199 → 200
  '/advocate/notice/[id]/tracking': '/advocate/notice/[id]/confirm', // 200 → 201
  '/advocate/notice/[id]/confirm': '/advocate/notice/[id]/received', // 201 → 202
  '/advocate/notice/[id]/received': '/advocate/notice/[id]/report', // 202 → 203
  '/advocate/notice/[id]/report': '/advocate/notice/draft-editor', // 203 → 266
  '/advocate/notice/draft-editor': '/advocate/notice/response-editor', // 266 → 267
  // last: /advocate/notice/response-editor (267)
  // ── advocate/notifications ──
  // last: /advocate/notifications (150)
  // ── advocate/property-search ──
  '/advocate/property-search/[id]/editor': '/advocate/property-search/[id]/request', // 208 → 208
  '/advocate/property-search/[id]/request': '/advocate/property-search/[id]/response', // 208 → 209
  '/advocate/property-search/[id]/response': '/advocate/property-search/[id]/upload', // 209 → 210
  '/advocate/property-search/[id]/upload': '/advocate/property-search/[id]/send', // 210 → 211
  '/advocate/property-search/[id]/send': '/advocate/property-search/[id]/sent', // 211 → 212
  // last: /advocate/property-search/[id]/sent (212)
  // ── advocate/requests ──
  '/advocate/requests/[id]/schedule': '/advocate/requests/[id]/propose', // 164 → 165
  '/advocate/requests/[id]/propose': '/advocate/requests/[id]/confirmed', // 165 → 166
  // last: /advocate/requests/[id]/confirmed (166)
  // ── advocate/reviews ──
  // last: /advocate/reviews (264)
  // ── advocate/settings ──
  '/advocate/settings': '/advocate/settings/edit-profile', // 245 → 246
  '/advocate/settings/edit-profile': '/advocate/settings/password', // 246 → 247
  '/advocate/settings/password': '/advocate/settings/security', // 247 → 249
  '/advocate/settings/security': '/advocate/settings/documents', // 249 → 250
  '/advocate/settings/documents': '/advocate/settings/privacy', // 250 → 251
  '/advocate/settings/privacy': '/advocate/settings/permissions', // 251 → 252
  '/advocate/settings/permissions': '/advocate/settings/devices', // 252 → 253
  '/advocate/settings/devices': '/advocate/settings/data', // 253 → 254
  '/advocate/settings/data': '/advocate/settings/language', // 254 → 255
  '/advocate/settings/language': '/advocate/settings/payout', // 255 → 256
  '/advocate/settings/payout': '/advocate/settings/bank', // 256 → 257
  '/advocate/settings/bank': '/advocate/settings/bank/update', // 257 → 258
  '/advocate/settings/bank/update': '/advocate/settings/bank/verify', // 258 → 259
  '/advocate/settings/bank/verify': '/advocate/settings/bank/updated', // 259 → 260
  // last: /advocate/settings/bank/updated (260)
  // ── advocate/verify ──
  '/advocate/verify/intro': '/advocate/verify/personal', // 233 → 234
  '/advocate/verify/personal': '/advocate/verify/professional', // 234 → 235
  '/advocate/verify/professional': '/advocate/verify/bar-council', // 235 → 236
  '/advocate/verify/bar-council': '/advocate/verify/practice', // 236 → 237
  '/advocate/verify/practice': '/advocate/verify/documents', // 237 → 238
  '/advocate/verify/documents': '/advocate/verify/review', // 238 → 239
  '/advocate/verify/review': '/advocate/verify/submitted', // 239 → 240
  '/advocate/verify/submitted': '/advocate/verify/incomplete', // 240 → 241
  '/advocate/verify/incomplete': '/advocate/verify/needs-update', // 241 → 243
  '/advocate/verify/needs-update': '/advocate/verify/complete', // 243 → 244
  // last: /advocate/verify/complete (244)
  // ── advocate/wallet ──
  '/advocate/wallet/withdraw': '/advocate/wallet/bank', // 359 → 360
  '/advocate/wallet/bank': '/advocate/wallet/utr', // 360 → 361
  // last: /advocate/wallet/utr (361)
  // ── advocates ──
  '/advocates/rahul-sharma': '/advocates', // 433: standalone; identity confirmation pending
  '/advocates': '/advocates/[id]', // 55 → 81
  // last: /advocates/[id] (81)
  // ── callback ──
  // last: /callback (36)
  // ── chat ──
  // last: /chat/advocate (33)
  // ── clients ──
  // last: /clients (151)
  // ── courier ──
  '/courier/delivery-details': '/courier/payment', // 276 → 277
  '/courier/payment': '/courier/scan-pay', // 277 → 278
  '/courier/scan-pay': '/courier/success', // 278 → 279
  '/courier/success': '/courier/shipment', // 279 → 280
  '/courier/shipment': '/courier/tracking', // 280 → 281
  '/courier/tracking': '/courier/choose', // 281 → 284
  '/courier/choose': '/courier/self/instructions', // 284 → 285
  '/courier/self/instructions': '/courier/self/details', // 285 → 286
  '/courier/self/details': '/courier/self/sent', // 286 → 287
  // last: /courier/self/sent (287)
  // ── dashboard ──
  // last: /dashboard (148)
  // ── document-forensic ──
  '/document-forensic': '/document-forensic/info', // 82 → 83
  '/document-forensic/info': '/document-forensic/upload', // 83 → 84
  '/document-forensic/upload': '/document-forensic/review', // 84 → 85
  '/document-forensic/review': '/document-forensic/payment', // 85 → 86
  '/document-forensic/payment': '/document-forensic/submitted', // 86 → 88
  '/document-forensic/submitted': '/document-forensic/track', // 88 → 89
  '/document-forensic/track': '/document-forensic/report', // 89 → 90
  // last: /document-forensic/report (90)
  // ── documents ──
  '/documents/case': '/documents', // 52 → 56
  '/documents': '/documents/[id]', // 56 → 57
  // last: /documents/[id] (57)
  // ── fir ──
  '/fir': '/fir/step1', // 40 → 42
  '/fir/step1': '/fir/step2', // 42 → 43
  '/fir/step2': '/fir/step3', // 43 → 44
  '/fir/step3': '/fir/step4', // 44 → 45
  '/fir/step4': '/fir/step5', // 45 → 46
  '/fir/step5': '/fir/payment', // 46 → shared payment → success → 47
  '/fir/submitted': '/fir/status', // 47 → 48
  '/fir/status': '/fir/ready', // 48 → 49
  // last: /fir/ready (49)
  // ── help ──
  // last: /help (69)
  // ── home ──
  // last: /home (11)
  // ── kyc ──
  '/kyc/choose': '/kyc/digilocker/connect', // 92 → 93
  '/kyc/digilocker/connect': '/kyc/digilocker/checking', // 93 → 94
  '/kyc/digilocker/checking': '/kyc/digilocker/verified', // 94 → 95
  '/kyc/digilocker/verified': '/kyc/video/intro', // 95 → 96
  '/kyc/video/intro': '/kyc/video/device-check', // 96 → 97
  '/kyc/video/device-check': '/kyc/video/capture', // 97 → 98
  '/kyc/video/capture': '/kyc/video/verified', // 98 → 99
  '/kyc/video/verified': '/kyc/video/error', // 99 → 100
  // last: /kyc/video/error (100)
  // ── language ──
  // last: /language (61)
  // ── legal-advice ──
  '/legal-advice': '/legal-advice/info', // 102 → 103
  '/legal-advice/info': '/legal-advice/choose', // 103 → 104
  '/legal-advice/choose': '/legal-advice/details', // 104 → 105
  '/legal-advice/details': '/legal-advice/matter', // 105 → 106
  '/legal-advice/matter': '/legal-advice/review', // 106 → 107
  '/legal-advice/review': '/legal-advice/payment', // 107 → 108
  // Payment routes supply their service-specific success query to ScanPayScreen.
  '/legal-advice/confirmed': '/legal-advice/track', // 111 → 112
  '/legal-advice/track': '/legal-advice/session/chat', // 112 → 113
  '/legal-advice/session/chat': '/legal-advice/session/video', // 113 → 114
  '/legal-advice/session/video': '/legal-advice/session/audio', // 114 → 115
  '/legal-advice/session/audio': '/legal-advice/completed', // 115 → 116
  '/legal-advice/completed': '/legal-advice/followup', // 116 → 117
  '/legal-advice/followup': '/legal-advice/rate', // 117 → 119
  '/legal-advice/rate': '/legal-advice/experience', // 119 → 122
  '/legal-advice/experience': '/legal-advice/datetime', // 122 → 124
  // last: /legal-advice/datetime (124)
  // ── legal-notice ──
  '/legal-notice/detail': '/legal-notice', // 23 → entry 22
  '/legal-notice': '/legal-notice/step3', // owner-instructed type first
  '/legal-notice/step1': '/legal-notice/demand', // sender → demand
  '/legal-notice/step2': '/legal-notice/step1', // noticee → sender
  '/legal-notice/step3': '/legal-notice/step2', // type → noticee
  '/legal-notice/demand': '/legal-notice/step4', // instructed demand → documents
  '/legal-notice/step5': '/legal-notice/step6', // 27 → 28
  '/legal-notice/step6': '/legal-notice/scan-pay', // 28 → 29
  '/legal-notice/scan-pay': '/legal-notice/success', // 29 → 30
  '/legal-notice/success': '/legal-notice/tracking', // 30 → 31
  '/legal-notice/tracking': '/legal-notice/request-submitted', // 32 → 437
  '/legal-notice/request-submitted': '/legal-notice/delivery', // 437 → 440
  '/legal-notice/request-changes': '/chat/advocate', // 438 → 439
  '/legal-notice/delivery': '/legal-notice/delivered', // 440 → 441
  '/legal-notice/delivered': '/cases', // terminal delivery → case list
  '/legal-notice/delivery-proof': '/legal-notice/delivered',
  '/legal-notice/step4': '/legal-notice/step4-review',
  '/legal-notice/step4-review': '/legal-notice/step5',
  // ── login ──
  // last: /login (134)
  // ── matters ──
  // last: /matters (162)
  // ── messages ──
  '/messages': '/messages/[id]', // 142 → 143
  // last: /messages/[id] (143)
  // ── notifications ──
  // last: /notifications (60)
  // ── onboarding ──
  // last: /onboarding (125)
  // ── payments ──
  // last: /payments (58)
  // ── privacy ──
  // last: /privacy (62)
  // ── profile ──
  '/profile': '/profile/edit', // 50 → 51
  // last: /profile/edit (51)
  // ── property-search ──
  '/property-search': '/property-search/info', // 72 → 73
  '/property-search/info': '/property-search/review', // 73 → 76
  '/property-search/review': '/property-search/payment', // 76 → 77
  '/property-search/payment': '/property-search/track', // 77 → 78
  '/property-search/track': '/property-search/checking', // 78 → 79
  '/property-search/checking': '/property-search/completed', // 79 → 80
  // last: /property-search/completed (80)
  // ── requests ──
  '/requests': '/requests/[id]', // 53 → 54
  // last: /requests/[id] (54)
  // ── services/district-court ──
  '/services/district-court/request-submitted': '/services/district-court/advocate-assigned', // 299 → 300
  '/services/district-court/advocate-assigned': '/services/district-court/case-preparation', // 300 → 313
  '/services/district-court/case-preparation': '/services/district-court/court-fee', // 313 → 314
  '/services/district-court/court-fee': '/services/district-court/court-fee-payment', // 314 → 314
  '/services/district-court/court-fee-payment': '/services/high-court/review-filing', // 315–317 → 318, as the screen routes
  '/services/district-court/court-filing': '/services/district-court/process-fee', // 320 → 321
  '/services/district-court/process-fee': '/services/district-court/process-fee-payment', // 321 → 321
  '/services/district-court/process-fee-payment': '/services/district-court/process-fee-receipt', // 321 → 325
  '/services/district-court/process-fee-receipt': '/services/district-court/first-hearing', // 325 → 326
  '/services/district-court/first-hearing': '/services/district-court/case-overview', // 326 → 327
  '/services/district-court/case-overview': '/services/district-court/next-hearing', // 327 → 328
  '/services/district-court/next-hearing': '/services/district-court/change-advocate', // 328 → 329
  '/services/district-court/change-advocate': '/services/district-court/change-advocate-payment', // 329 → 329
  '/services/district-court/change-advocate-payment': '/services/district-court/case-completed', // 329 → 335
  '/services/district-court/case-completed': '/services/district-court', // 335 → 338
  '/services/district-court': '/services/district-court/learn-more', // 338 → 339
  '/services/district-court/learn-more': '/services/district-court/case-type', // 339 → 340
  '/services/district-court/case-type': '/services/district-court/pricing', // 340 → 343
  '/services/district-court/pricing': '/services/district-court/payment', // 343 → 344
  '/services/district-court/payment': '/services/district-court/request-submitted', // 296–298 → 299, as the screen routes
  '/services/district-court/advocate/decide': '/services/district-court/advocate/accepted', // 345 → 346
  '/services/district-court/advocate/accepted': '/services/district-court/documents-needed', // 346 → its held Waiting for Advocate bar's own screen
  '/services/district-court/advocate/change': '/services/district-court/advocate/change-sent', // 347 → 348
  '/services/district-court/advocate/change-sent': '/services/district-court/advocate/cancel', // 348 → 349
  '/services/district-court/advocate/cancel': '/services/district-court/courier/details', // 349 → 351
  '/services/district-court/courier/details': '/services/district-court/courier/book', // 351 → 352
  '/services/district-court/courier/book': '/services/district-court/courier/shipment', // 352 → 353
  '/services/district-court/courier/shipment': '/services/district-court/courier/tracking', // 353 → 354
  '/services/district-court/courier/tracking': '/services/district-court/courier/received', // 354 → 355
  // last: /services/district-court/courier/received (355)
  // ── services/high-court ──
  '/services/high-court': '/services/high-court/learn-more', // 289 → 290
  '/services/high-court/learn-more': '/services/high-court/case-type', // 290 → 291
  '/services/high-court/case-type': '/services/high-court/matter-type', // 291 → 292
  '/services/high-court/matter-type': '/services/high-court/case-details', // 292 → 293
  '/services/high-court/case-details': '/services/high-court/documents', // 293 → 294
  '/services/high-court/documents': '/services/high-court/pricing', // 294 → 295
  '/services/high-court/pricing': '/services/high-court/payment', // 295 → 298
  '/services/high-court/payment': '/services/district-court/request-submitted', // 298 → 299, as the screen routes
  '/services/high-court/chat': '/services/high-court/confirm-advocate', // 301 → 302
  '/services/high-court/confirm-advocate': '/services/high-court/documents-needed', // 302 → 303
  '/services/high-court/documents-needed': '/services/high-court/send-documents', // 303 → 304
  '/services/high-court/send-documents': '/services/high-court/courier/booking', // 304 → 305
  '/services/high-court/courier/booking': '/services/high-court/courier/confirm', // 305 → 306
  '/services/high-court/courier/confirm': '/services/high-court/courier/shipment', // 306 → 310
  '/services/high-court/courier/shipment': '/services/high-court/courier/tracking', // 310 → 311
  '/services/high-court/courier/tracking': '/services/high-court/courier/delivered', // 311 → 312
  '/services/high-court/courier/delivered': '/services/high-court/review-filing', // 312 → 318
  '/services/high-court/review-filing': '/services/high-court/change-request', // 318 → 319
  '/services/high-court/change-request': '/services/high-court/pending/details', // 319 → 330
  '/services/high-court/pending/details': '/services/high-court/pending/payment', // 330 → 334
  '/services/high-court/pending/payment': '/services/high-court/pending/verification', // 334 → 334
  // last: /services/high-court/pending/verification (334)
  // ── signup ──
  // last: /signup (136)
  // ── signup-success ──
  // last: /signup-success (138)
  // ── signup-verify ──
  // last: /signup-verify (137)
  // ── support ──
  // last: /support (70)
  // ── support-chat ──
  // last: /support-chat (35)
  // ── verify ──
  // last: /verify (135)
};

/**
 * Per-route button overrides: a static control that leads to its own drawn
 * screen rather than to the flow's next step.
 */
export const BUTTON_TARGETS: Record<string, Record<string, string>> = {
  // design/364 (HC and DC): Chat with Client opens 365, Call Client 369.
  '/advocate/court/ai-summary': { 'Chat with Client': '/advocate/court/chat', 'Call Client': '/advocate/court/call' },
  // design/365: the header phone opens the call (369).
  '/advocate/court/chat': { 'Call Client': '/advocate/court/call' },
  // design/381: Back to Case would return to 380; the flow goes on to 382.
  '/advocate/court/court-fee/sent': { 'Back to Case': '/advocate/court/pre-filing-review' },
  // design/392: the change-advocate branch (393–395) runs before the dashboard.
  '/advocate/court/hearing/next': { 'Save Next Hearing': '/advocate/court/change-advocate' },
  // design/383: Close returns to the review it sits over.
  '/advocate/court/client-approved': { Close: '/advocate/court/court-filing' },
};

const toRe = (p: string) => new RegExp('^' + p.replace(/\[[^\]]+\]/g, '([^/]+)') + '$');

/** The flow's next route from `path`, or undefined at a section's end. */
export function nextRoute(path: string, label?: string): string | undefined {
  const own = BUTTON_TARGETS[path]?.[label ?? ''];
  if (own) return own;
  // Static screens must win over parameter routes such as /advocate/fir/[id].
  // Otherwise Waiting's timer returns to documents instead of the next review.
  const exact = FLOW_MAP[path];
  if (exact !== undefined) return exact === TERMINAL ? undefined : exact.replace(/\[[^\]]+\]/g, '1');
  for (const [from, to] of Object.entries(FLOW_MAP)) {
    const m = path.match(toRe(from));
    if (!m) continue;
    if (to === TERMINAL) return undefined;
    let i = 1;
    return to.replace(/\[[^\]]+\]/g, () => m[i++] ?? '1');
  }
  return undefined;
}
