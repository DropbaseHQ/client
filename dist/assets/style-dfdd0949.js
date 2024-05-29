import{ic as c,sZ as r,bu as d,to as m,pk as l,o_ as u,s5 as b,db as k,dj as g}from"./vendor-332432be.js";import{aY as f,k_ as w}from"./index-5b71d1bd.js";c((n,o)=>{const s=f(n);o.addRule(`.monaco-workbench { background-color: ${s}; }`);const a=n.getColor(r);if(a&&o.addRule(`.monaco-workbench ::selection { background-color: ${a}; }`),d){const t=n.getColor(w);if(t){const i="monaco-workbench-meta-theme-color";let e=document.getElementById(i);e||(e=m(),e.name="theme-color",e.id=i),e.content=t.toString()}}l&&o.addRule(`
			body.web {
				touch-action: none;
			}
			.monaco-workbench .monaco-editor .view-lines {
				user-select: text;
				-webkit-user-select: text;
			}
		`),u&&b()&&o.addRule(`body { background-color: ${s}; }`)});const h=k?'"Segoe WPC", "Segoe UI", sans-serif':g?"-apple-system, BlinkMacSystemFont, sans-serif":'system-ui, "Ubuntu", "Droid Sans", sans-serif';export{h as D};
