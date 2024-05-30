import{_ as m,h as r,B as I,nj as _,af as O,nk as b,eZ as U,e0 as W}from"./index-5b71d1bd.js";import{cb as B,b8 as x,bn as D,ca as J,d_ as C,dq as E,aZ as N,ds as M,aM as j,e9 as v,bu as l,fL as a,a8 as $,um as R,un as P,uo as H,af as G,rW as f,rX as y,fu as K}from"./vendor-332432be.js";const h=12,T=`${f}/vscode-regexp-languagedetection`,A=`${y}/vscode-regexp-languagedetection`,L=`${f}/@vscode/vscode-languagedetection`,S=`${y}/@vscode/vscode-languagedetection`;let o=class n extends j{constructor(t,e,s,i,g,c,u,d,p,k,w){super(),this._environmentService=t,this._configurationService=s,this._diagnosticsService=i,this._workspaceContextService=g,this._editorService=u,this._logService=k,this.hasResolvedWorkspaceLanguageIds=!1,this.workspaceLanguageIds=new Set,this.sessionOpenedLanguageIds=new Set,this.historicalGlobalOpenedLanguageIds=new v(h),this.historicalWorkspaceOpenedLanguageIds=new v(h),this.dirtyBiases=!0,this.langBiases={},this._languageDetectionWorkerClient=new F(c,e,d,this._environmentService.isBuilt&&!l?a.asBrowserUri(`${S}/dist/lib/index.js`).toString(!0):a.asBrowserUri(`${L}/dist/lib/index.js`).toString(!0),this._environmentService.isBuilt&&!l?a.asBrowserUri(`${S}/model/model.json`).toString(!0):a.asBrowserUri(`${L}/model/model.json`).toString(!0),this._environmentService.isBuilt&&!l?a.asBrowserUri(`${S}/model/group1-shard1of1.bin`).toString(!0):a.asBrowserUri(`${L}/model/group1-shard1of1.bin`).toString(!0),this._environmentService.isBuilt&&!l?a.asBrowserUri(`${A}/dist/index.js`).toString(!0):a.asBrowserUri(`${T}/dist/index.js`).toString(!0),w),this.initEditorOpenedListeners(p)}async resolveWorkspaceLanguageIds(){if(this.hasResolvedWorkspaceLanguageIds)return;this.hasResolvedWorkspaceLanguageIds=!0;const t=await this._diagnosticsService.getWorkspaceFileExtensions(this._workspaceContextService.getWorkspace());let e=0;for(const s of t.extensions){const i=this._languageDetectionWorkerClient.getLanguageId(s);if(i&&e<h&&(this.workspaceLanguageIds.add(i),e++,e>h))break}this.dirtyBiases=!0}isEnabledForLanguage(t){return!!t&&this._configurationService.getValue(n.enablementSettingKey,{overrideIdentifier:t})}getLanguageBiases(){if(!this.dirtyBiases)return this.langBiases;const t={};return this.sessionOpenedLanguageIds.forEach(e=>t[e]=(t[e]??0)+7),this.workspaceLanguageIds.forEach(e=>t[e]=(t[e]??0)+5),[...this.historicalWorkspaceOpenedLanguageIds.keys()].forEach(e=>t[e]=(t[e]??0)+3),[...this.historicalGlobalOpenedLanguageIds.keys()].forEach(e=>t[e]=(t[e]??0)+1),this._logService.trace("Session Languages:",JSON.stringify([...this.sessionOpenedLanguageIds])),this._logService.trace("Workspace Languages:",JSON.stringify([...this.workspaceLanguageIds])),this._logService.trace("Historical Workspace Opened Languages:",JSON.stringify([...this.historicalWorkspaceOpenedLanguageIds.keys()])),this._logService.trace("Historical Globally Opened Languages:",JSON.stringify([...this.historicalGlobalOpenedLanguageIds.keys()])),this._logService.trace("Computed Language Detection Biases:",JSON.stringify(t)),this.dirtyBiases=!1,this.langBiases=t,t}async detectLanguage(t,e){const s=this._configurationService.getValue(n.historyBasedEnablementConfig),i=this._configurationService.getValue(n.preferHistoryConfig);s&&await this.resolveWorkspaceLanguageIds();const g=s?this.getLanguageBiases():void 0;return this._languageDetectionWorkerClient.detectLanguage(t,g,i,e)}initEditorOpenedListeners(t){try{const e=JSON.parse(t.get(n.globalOpenedLanguagesStorageKey,0,"[]"));this.historicalGlobalOpenedLanguageIds.fromJSON(e)}catch(e){console.error(e)}try{const e=JSON.parse(t.get(n.workspaceOpenedLanguagesStorageKey,1,"[]"));this.historicalWorkspaceOpenedLanguageIds.fromJSON(e)}catch(e){console.error(e)}this._register(this._editorService.onDidActiveEditorChange(()=>{var s,i;const e=this._editorService.activeTextEditorLanguageId;e&&((i=(s=this._editorService.activeEditor)==null?void 0:s.resource)==null?void 0:i.scheme)!==$.untitled&&(this.sessionOpenedLanguageIds.add(e),this.historicalGlobalOpenedLanguageIds.set(e,!0),this.historicalWorkspaceOpenedLanguageIds.set(e,!0),t.store(n.globalOpenedLanguagesStorageKey,JSON.stringify(this.historicalGlobalOpenedLanguageIds.toJSON()),0,1),t.store(n.workspaceOpenedLanguagesStorageKey,JSON.stringify(this.historicalWorkspaceOpenedLanguageIds.toJSON()),1,1),this.dirtyBiases=!0)}))}};o.enablementSettingKey="workbench.editor.languageDetection";o.historyBasedEnablementConfig="workbench.editor.historyBasedLanguageDetection";o.preferHistoryConfig="workbench.editor.preferHistoryBasedLanguageDetection";o.workspaceOpenedLanguagesStorageKey="workbench.editor.languageDetectionOpenedLanguages.workspace";o.globalOpenedLanguagesStorageKey="workbench.editor.languageDetectionOpenedLanguages.global";o=m([r(0,I),r(1,B),r(2,x),r(3,_),r(4,D),r(5,J),r(6,O),r(7,C),r(8,E),r(9,N),r(10,M)],o);class F extends R{constructor(t,e,s,i,g,c,u,d){super(t,!0,"languageDetectionWorkerService",d),this._languageService=e,this._telemetryService=s,this._indexJsUri=i,this._modelJsonUri=g,this._weightsUri=c,this._regexpModelUri=u}_getOrCreateLanguageDetectionWorker(){return this.workerPromise?this.workerPromise:(this.workerPromise=new Promise((t,e)=>{t(this._register(new P(this._workerFactory,"vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker",new H(this))))}),this.workerPromise)}_guessLanguageIdByUri(t){const e=this._languageService.guessLanguageIdByFilepathOrFirstLine(t);if(e&&e!=="unknown")return e}async _getProxy(){return(await this._getOrCreateLanguageDetectionWorker()).getProxyObject()}async fhr(t,e){switch(t){case"getIndexJsUri":return this.getIndexJsUri();case"getModelJsonUri":return this.getModelJsonUri();case"getWeightsUri":return this.getWeightsUri();case"getRegexpModelUri":return this.getRegexpModelUri();case"getLanguageId":return this.getLanguageId(e[0]);case"sendTelemetryEvent":return this.sendTelemetryEvent(e[0],e[1],e[2]);default:return super.fhr(t,e)}}async getIndexJsUri(){return this._indexJsUri}getLanguageId(t){if(!t)return;if(this._languageService.isRegisteredLanguageId(t))return t;const e=this._guessLanguageIdByUri(G.file(`file.${t}`));if(!(!e||e==="unknown"))return e}async getModelJsonUri(){return this._modelJsonUri}async getWeightsUri(){return this._weightsUri}async getRegexpModelUri(){return this._regexpModelUri}async sendTelemetryEvent(t,e,s){this._telemetryService.publicLog2(b,{languages:t.join(","),confidences:e.join(","),timeSpent:s})}async detectLanguage(t,e,s,i){const g=Date.now(),c=this._guessLanguageIdByUri(t);if(c)return c;await this._withSyncedResources([t]);const u=await(await this._getProxy()).detectLanguage(t.toString(),e,s,i),d=this.getLanguageId(u),p="automaticlanguagedetection.perf";return this._telemetryService.publicLog2(p,{timeSpent:Date.now()-g,detection:d||"unknown"}),d}}U({"vs/../../node_modules/@vscode/vscode-languagedetection/model/model.json":new URL("@vscode/vscode-languagedetection/model/model.json",self.location).href,"vs/../../node_modules/@vscode/vscode-languagedetection/model/group1-shard1of1.bin":new URL("@vscode/vscode-languagedetection/model/group1-shard1of1.bin",self.location).href});function X(){return{[W.toString()]:new K(o)}}export{X as default};