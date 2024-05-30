import{k$ as m,R as re,I as ce,af as le,l0 as de,_ as L,h as k,dr as ue,hR as fe,l1 as ge,hS as Se,bu as he}from"./index-5b71d1bd.js";import{av as o,f0 as me,lU as be,af as ve,f1 as H,ek as O,ej as ye,cb as U,bn as we,be as Ie,cm as Ce,bk as x,cw as X,cO as T,bj as xe,iI as ke,eI as D,gk as Pe,gT as Ae,ey as $e,br as z,by as q,bx as B,eH as _,eL as G,aY as W,bH as Ee,lM as P,dt as Te,b8 as _e,d8 as Ne,b6 as K,e$ as E,ex as je,aW as R,dm as Me,k$ as Fe,dO as Le,fu as Oe,fg as Ue}from"./vendor-332432be.js";const Q={category:{value:o("snippets","Snippets"),original:"Snippets"}};class J extends me{constructor(e){super({...Q,...e})}}class Y extends be{constructor(e){super({...Q,...e})}}var N;(function(u){function e(i){return!!i&&ve.isUri(i.filepath)}u.is=e})(N||(N={}));async function De(u,e,i,p){const s=[],r=[],n=new Set,d=new Map;for(const t of await u.getSnippetFiles())if(t.source!==3)if(t.isGlobalSnippets){await t.load();const a=new Set;let l;e:for(const g of t.data){l||(l=g.source);for(const b of g.scopes){const v=i.getLanguageName(b);if(v)if(a.size>=4){a.add(`${v}...`);break e}else a.add(v)}}const f={label:x(t.location),filepath:t.location,description:a.size===0?o("global.scope","(global)"):o("global.1","({0})",[...a].join(", "))};if(s.push(f),!l)continue;const S=o("detail.label","({0}) {1}",l,p.getUriLabel(t.location,{relative:!0})),h=d.get(x(t.location));h&&(f.detail=S,h.snippet.detail=h.detail),d.set(x(t.location),{snippet:f,detail:S})}else{const a=x(t.location).replace(/\.json$/,"");s.push({label:x(t.location),description:`(${i.getLanguageName(a)})`,filepath:t.location}),n.add(a)}const c=e.currentProfile.snippetsHome;for(const t of i.getRegisteredLanguageIds()){const a=i.getLanguageName(t);a&&!n.has(t)&&r.push({label:t,description:`(${a})`,filepath:X(c,`${t}.json`),hint:!0})}return s.sort((t,a)=>{const l=T(t.filepath.path),f=T(a.filepath.path);return l===f?t.label.localeCompare(a.label):l===".code-snippets"?-1:1}),r.sort((t,a)=>t.label.localeCompare(a.label)),{existing:s,future:r}}async function V(u,e,i,p,s,r){function n(t){const a=T(t)!==".code-snippets"?`${t}.code-snippets`:t;return X(e,a)}await p.createFolder(e);const d=await i.input({placeHolder:o("name","Type snippet file name"),async validateInput(t){if(!t)return o("bad_name1","Invalid file name");if(!xe(t))return o("bad_name2","'{0}' is not a valid file name",t);if(await p.exists(n(t)))return o("bad_name3","'{0}' already exists",t)}});if(!d)return;const c=n(d);await s.write(c,["{","	// Place your "+u+" snippets here. Each snippet is defined under a snippet name and has a scope, prefix, body and ","	// description. Add comma separated ids of the languages where the snippet is applicable in the scope field. If scope ","	// is left empty or omitted, the snippet gets applied to all languages. The prefix is what is ","	// used to trigger the snippet and the body will be expanded and inserted. Possible variables are: ","	// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. ","	// Placeholders with the same ids are connected.","	// Example:",'	// "Print to console": {','	// 	"scope": "javascript,typescript",','	// 	"prefix": "log",','	// 	"body": [',`	// 		"console.log('$1');",`,'	// 		"$2"',"	// 	],",'	// 	"description": "Log output to console"',"	// }","}"].join(`
`)),await r.open(c)}async function We(u,e,i){if(await e.exists(u.filepath))return;const p=["{","	// Place your snippets for "+u.label+" here. Each snippet is defined under a snippet name and has a prefix, body and ","	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:","	// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. Placeholders with the ","	// same ids are connected.","	// Example:",'	// "Print to console": {','	// 	"prefix": "log",','	// 	"body": [',`	// 		"console.log('$1');",`,'	// 		"$2"',"	// 	],",'	// 	"description": "Log output to console"',"	// }","}"].join(`
`);await i.write(u.filepath,p)}class Re extends J{constructor(){super({id:"workbench.action.openSnippets",title:{value:o("openSnippet.label","Configure User Snippets"),original:"Configure User Snippets"},shortTitle:{value:o("userSnippets","User Snippets"),mnemonicTitle:o({key:"miOpenSnippets",comment:["&& denotes a mnemonic"]},"User &&Snippets"),original:"User Snippets"},f1:!0,menu:[{id:H.MenubarPreferencesMenu,group:"2_configuration",order:4},{id:H.GlobalActivity,group:"2_configuration",order:4}]})}async run(e){const i=e.get(m),p=e.get(O),s=e.get(ye),r=e.get(U),n=e.get(re),d=e.get(we),c=e.get(Ie),t=e.get(ce),a=e.get(Ce),l=await De(i,n,r,a),f=l.existing,S=[{scope:o("new.global_scope","global"),label:o("new.global","New Global Snippets file..."),uri:n.currentProfile.snippetsHome}],h=[];for(const b of d.getWorkspace().folders)h.push({scope:o("new.workspace_scope","{0} workspace",b.name),label:o("new.folder","New Snippets file for '{0}'...",b.name),uri:b.toResource(".vscode")});f.length>0?(f.unshift({type:"separator",label:o("group.global","Existing Snippets")}),f.push({type:"separator",label:o("new.global.sep","New Snippets")})):f.push({type:"separator",label:o("new.global.sep","New Snippets")});const g=await p.pick([].concat(f,S,h,l.future),{placeHolder:o("openSnippet.pickLanguage","Select Snippets File or Create Snippets"),matchOnDescription:!0});if(S.indexOf(g)>=0)return V(g.scope,g.uri,p,c,t,s);if(h.indexOf(g)>=0)return V(g.scope,g.uri,p,c,t,s);if(N.is(g))return g.hint&&await We(g,c,t),s.open(g.filepath)}}class I extends J{constructor(){super({id:I.Id,title:{value:o("label","Fill File with Snippet"),original:"Fill File with Snippet"},f1:!0})}async run(e){var t;const i=e.get(m),p=e.get(O),s=e.get(le),r=e.get(U),n=ke(s.activeTextEditorControl);if(!n||!n.hasModel())return;const d=await i.getSnippets(void 0,{fileTemplateSnippets:!0,noRecencySort:!0,includeNoPrefixSnippets:!0});if(d.length===0)return;const c=await this._pick(p,r,d);c&&n.hasModel()&&((t=D.get(n))==null||t.apply([{range:n.getModel().getFullModelRange(),template:c.snippet.body}]),n.getModel().setLanguage(r.createById(c.langId),I.Id),n.focus())}async _pick(e,i,p){const s=[];for(const c of p)if(Pe(c.scopes))s.push({langId:"",snippet:c});else for(const t of c.scopes)s.push({langId:t,snippet:c});const r=[],n=Ae(s,(c,t)=>$e(c.langId,t.langId));for(const c of n){let t=!0;for(const a of c)t&&(r.push({type:"separator",label:i.getLanguageName(a.langId)??a.langId}),t=!1),r.push({snippet:a,label:a.snippet.prefix||a.snippet.name,detail:a.snippet.description})}const d=await e.pick(r,{placeHolder:o("placeholder","Select a snippet"),matchOnDetail:!0});return d==null?void 0:d.snippet}}I.Id="workbench.action.populateFileFromSnippet";async function Z(u,e){var c;const i=u.get(m),p=u.get(O);let s;Array.isArray(e)?s=e:s=await i.getSnippets(e,{includeDisabledSnippets:!0,includeNoPrefixSnippets:!0}),s.sort((t,a)=>t.snippetSource-a.snippetSource);const r=()=>{const t=[];let a;for(const l of s){const f={label:l.prefix||l.name,detail:l.description||l.body,snippet:l};if(!a||a.snippetSource!==l.snippetSource||a.source!==l.source){let S="";switch(l.snippetSource){case 1:S=o("sep.userSnippet","User Snippets");break;case 3:S=l.source;break;case 2:S=o("sep.workspaceSnippet","Workspace Snippets");break}t.push({type:"separator",label:S})}l.snippetSource===3&&(i.isEnabled(l)?f.buttons=[{iconClass:q.asClassName(B.eyeClosed),tooltip:o("disableSnippet","Hide from IntelliSense")}]:(f.description=o("isDisabled","(hidden from IntelliSense)"),f.buttons=[{iconClass:q.asClassName(B.eye),tooltip:o("enable.snippet","Show in IntelliSense")}])),t.push(f),a=l}return t},n=p.createQuickPick();n.placeholder=o("pick.placeholder","Select a snippet"),n.matchOnDetail=!0,n.ignoreFocusOut=!1,n.keepScrollPosition=!0,n.onDidTriggerItemButton(t=>{const a=i.isEnabled(t.item.snippet);i.updateEnablement(t.item.snippet,!a),n.items=r()}),n.items=r(),n.items.length||(n.validationMessage=o("pick.noSnippetAvailable","No snippet available")),n.show(),await Promise.race([z.toPromise(n.onDidAccept),z.toPromise(n.onDidHide)]);const d=(c=n.selectedItems[0])==null?void 0:c.snippet;return n.dispose(),d}class C{static fromUser(e){if(!e||typeof e!="object")return C._empty;let{snippet:i,name:p,langId:s}=e;return typeof i!="string"&&(i=void 0),typeof p!="string"&&(p=void 0),typeof s!="string"&&(s=void 0),new C(i,p,s)}constructor(e,i,p){this.snippet=e,this.name=i,this.langId=p}}C._empty=new C(void 0,void 0,void 0);class He extends Y{constructor(){super({id:"editor.action.insertSnippet",title:{value:o("snippet.suggestions.label","Insert Snippet"),original:"Insert Snippet"},f1:!0,precondition:_.writable,description:{description:"Insert Snippet",args:[{name:"args",schema:{type:"object",properties:{snippet:{type:"string"},langId:{type:"string"},name:{type:"string"}}}}]}})}async runEditorCommand(e,i,p){var a;const s=e.get(U),r=e.get(m);if(!i.hasModel())return;const n=e.get(G),d=e.get(W),c=await new Promise((l,f)=>{const{lineNumber:S,column:h}=i.getPosition(),{snippet:g,name:b,langId:v}=C.fromUser(p);if(g)return l(new de(!1,[],"","","",g,"",1,`random/${Math.random()}`));let w;if(v){if(!s.isRegisteredLanguageId(v))return l(void 0);w=v}else i.getModel().tokenization.tokenizeIfCheap(S),w=i.getModel().getLanguageIdAtPosition(S,h),s.getLanguageName(w)||(w=i.getModel().getLanguageId());b?r.getSnippets(w,{includeNoPrefixSnippets:!0}).then(ae=>ae.find(pe=>pe.name===b)).then(l,f):l(d.invokeFunction(Z,w))});if(!c)return;let t;c.needsClipboard&&(t=await n.readText()),i.focus(),(a=D.get(i))==null||a.insert(c.codeSnippet,{clipboardText:t}),r.updateUsageTimestamp(c)}}async function ee(u,e,i,p){const{lineNumber:s,column:r}=i;e.tokenization.tokenizeIfCheap(s);const n=e.getLanguageIdAtPosition(s,r);return(await u.getSnippets(n,{includeNoPrefixSnippets:!0,includeDisabledSnippets:p})).filter(c=>c.usesSelection)}class y extends Y{constructor(){super({...y.options,precondition:Ee.and(_.writable,_.hasNonEmptySelection),f1:!0})}async runEditorCommand(e,i){var t;if(!i.hasModel())return;const p=e.get(W),s=e.get(m),r=e.get(G),n=await ee(s,i.getModel(),i.getPosition(),!0);if(!n.length)return;const d=await p.invokeFunction(Z,n);if(!d)return;let c;d.needsClipboard&&(c=await r.readText()),i.focus(),(t=D.get(i))==null||t.insert(d.codeSnippet,{clipboardText:c}),s.updateUsageTimestamp(d)}}y.options={id:"editor.action.surroundWithSnippet",title:{value:o("label","Surround With Snippet..."),original:"Surround With Snippet..."}};let A=class j{constructor(e){this._snippetService=e}async provideCodeActions(e,i){if(i.isEmpty())return;const p=Ne.isISelection(i)?i.getPosition():i.getStartPosition(),s=await ee(this._snippetService,e,p,!1);if(!s.length)return;const r=[];for(const n of s){if(r.length>=j._MAX_CODE_ACTIONS){r.push(j._overflowCommandCodeAction);break}r.push({title:o("codeAction","Surround With: {0}",n.name),kind:P.SurroundWith.value,edit:te(e,i,n)})}return{actions:r,dispose(){}}}};A._MAX_CODE_ACTIONS=4;A._overflowCommandCodeAction={kind:P.SurroundWith.value,title:y.options.title.value,command:{id:y.options.id,title:y.options.title.value}};A=L([k(0,m)],A);let $=class M{constructor(e){this._snippetService=e,this.providedCodeActionKinds=[P.SurroundWith.value]}async provideCodeActions(e){if(e.getValueLength()!==0)return;const i=await this._snippetService.getSnippets(e.getLanguageId(),{fileTemplateSnippets:!0,includeNoPrefixSnippets:!0}),p=[];for(const s of i){if(p.length>=M._MAX_CODE_ACTIONS){p.push(M._overflowCommandCodeAction);break}p.push({title:o("title","Start with: {0}",s.name),kind:P.SurroundWith.value,edit:te(e,e.getFullModelRange(),s)})}return{actions:p,dispose(){}}}};$._MAX_CODE_ACTIONS=4;$._overflowCommandCodeAction={title:o("overflow.start.title","Start with Snippet"),kind:P.SurroundWith.value,command:{id:I.Id,title:""}};$=L([k(0,m)],$);function te(u,e,i){return{edits:[{versionId:u.getVersionId(),resource:u.uri,textEdit:{range:e,text:i.body,insertAsSnippet:!0}}]}}let F=class{constructor(e,i,p){this._store=new K;const s="editor.snippets.codeActions.enabled",r=new K,n=()=>{r.clear(),p.getValue(s)&&(r.add(i.codeActionProvider.register("*",e.createInstance(A))),r.add(i.codeActionProvider.register("*",e.createInstance($))))};n(),this._store.add(p.onDidChangeConfiguration(d=>d.affectsConfiguration(s)&&n())),this._store.add(r)}dispose(){this._store.dispose()}};F=L([k(0,W),k(1,Te),k(2,_e)],F);E(He);je.registerCommandAlias("editor.action.showSnippets","editor.action.insertSnippet");E(y);E(Re);E(I);R.as(ue.Workbench).registerWorkbenchContribution(F,3);R.as(Me.Configuration).registerConfiguration({...Fe,properties:{"editor.snippets.codeActions.enabled":{description:o("editor.snippets.codeActions.enabled","Controls if surround-with-snippets or file template snippets show as Code Actions."),type:"boolean",default:!0}}});const ie="vscode://schemas/snippets",ne={prefix:{description:o("snippetSchema.json.prefix","The prefix to use when selecting the snippet in intellisense"),type:["string","array"]},isFileTemplate:{description:o("snippetSchema.json.isFileTemplate","The snippet is meant to populate or replace a whole file"),type:"boolean"},body:{markdownDescription:o("snippetSchema.json.body","The snippet content. Use `$1`, `${1:defaultText}` to define cursor positions, use `$0` for the final cursor position. Insert variable values with `${varName}` and `${varName:defaultText}`, e.g. `This is file: $TM_FILENAME`."),type:["string","array"],items:{type:"string"}},description:{description:o("snippetSchema.json.description","The snippet description."),type:["string","array"]}},ze={id:ie,allowComments:!0,allowTrailingCommas:!0,defaultSnippets:[{label:o("snippetSchema.json.default","Empty snippet"),body:{"${1:snippetName}":{prefix:"${2:prefix}",body:"${3:snippet}",description:"${4:description}"}}}],type:"object",description:o("snippetSchema.json","User snippet configuration"),additionalProperties:{type:"object",required:["body"],properties:ne,additionalProperties:!1}},se="vscode://schemas/global-snippets",qe={id:se,allowComments:!0,allowTrailingCommas:!0,defaultSnippets:[{label:o("snippetSchema.json.default","Empty snippet"),body:{"${1:snippetName}":{scope:"${2:scope}",prefix:"${3:prefix}",body:"${4:snippet}",description:"${5:description}"}}}],type:"object",description:o("snippetSchema.json","User snippet configuration"),additionalProperties:{type:"object",required:["body"],properties:{...ne,scope:{description:o("snippetSchema.json.scope","A list of language names to which this snippet applies, e.g. 'typescript,javascript'."),type:"string"}},additionalProperties:!1}},oe=R.as(Le.JSONContribution);oe.registerSchema(ie,ze);oe.registerSchema(se,qe);Se(async u=>{u.get(he).when(2).then(()=>{Ue.get(m)})});function Xe(){return{...fe(),[m.toString()]:new Oe(ge)}}export{Xe as default};