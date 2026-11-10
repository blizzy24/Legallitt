// Explicit owner request, 11 Nov 2026: keep the primary folder, remove clean extras.
// Preserve ignored local settings without printing their values; never force removal.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=fs.realpathSync(path.resolve(__dirname,'..'));
assert.equal(root.toLowerCase(),'d:\\legalitt\\legallitt');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
assert.equal(git('branch','--show-current'),'services-consultation');
assert.equal(git('show','HEAD:apps/api/src/service-reports/report-submission.ts'),git('show','services-documents:apps/api/src/service-reports/report-submission.ts'));
const saved=path.join(root,'.env.worktree-backups.local');
for(const name of ['Legallitt-documents','wt-services']){
 const target=path.resolve(root,'..',name);
 if(!fs.existsSync(target)){assert.ok(!git('worktree','list','--porcelain').includes('worktree '+target.replaceAll('\\','/')));console.log(`Already removed ${target}`);continue;}
 assert.equal(fs.realpathSync(target).toLowerCase(),target.toLowerCase());
 assert.equal(path.dirname(target).toLowerCase(),path.dirname(root).toLowerCase());
 const registered=git('worktree','list','--porcelain').includes('worktree '+target.replaceAll('\\','/'));
 const before=git('rev-parse','services-documents');
 if(registered){assert.equal(git('-C',target,'status','--porcelain=v1','--untracked-files=all'),'','Refusing to remove uncommitted files');assert.equal(git('-C',target,'rev-parse','HEAD'),before);}
 else {assert.ok(!fs.existsSync(path.join(target,'.git')));assert.ok(fs.existsSync(path.join(saved,name,'apps/api/.env.local')),'Prior removal backup required');}
 for(const relative of ['apps/api/.env.local','apps/api/.env.before-isolation.local','apps/mobile/.env.local','apps/admin/.env.local','infra/local/.env.local']){
  const from=path.join(target,relative),to=path.join(saved,name,relative);
  if(fs.existsSync(from)){fs.mkdirSync(path.dirname(to),{recursive:true});if(fs.existsSync(to))assert.ok(fs.readFileSync(from).equals(fs.readFileSync(to)));else fs.copyFileSync(from,to,fs.constants.COPYFILE_EXCL);}
 }
 git('check-ignore',saved);
 // Git may unregister the worktree but leave long Windows dependency paths.
 if(registered)try{git('-c','core.longpaths=true','worktree','remove',target);}catch(error){if(git('worktree','list','--porcelain').includes('worktree '+target.replaceAll('\\','/')))throw error;}
 if(fs.existsSync(target)){
  assert.equal(fs.realpathSync(target).toLowerCase(),target.toLowerCase());
  assert.ok(!fs.existsSync(path.join(target,'.git')));
  fs.rmSync(path.toNamespacedPath(target),{recursive:true,force:false,maxRetries:3,retryDelay:250});
 }
 console.log(`Removed clean worktree ${target}; source retained at ${before}; local settings backed up.`);
}
console.log(git('worktree','list'));
