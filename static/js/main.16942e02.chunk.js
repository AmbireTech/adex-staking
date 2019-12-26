(this["webpackJsonpadex-staking-ui"]=this["webpackJsonpadex-staking-ui"]||[]).push([[0],{119:function(e){e.exports=JSON.parse('[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]')},185:function(e,t,n){e.exports=n.p+"static/media/adex-staking.bf64bad2.svg"},201:function(e,t,n){e.exports=n(326)},206:function(e,t,n){},208:function(e,t){},216:function(e,t){},218:function(e,t){},250:function(e,t){},326:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),o=n(12),l=n.n(o),i=(n(206),n(18)),s=n.n(i),u=n(43),c=n(33),p=n(392),d=n(190),m=n(398),y=n(183),b=n.n(y),f=n(181),w=n.n(f),g=n(182),x=n.n(g),v=n(184),h=n.n(v),E={primary:{main:"#1B75BC",contrastText:"#fff"},accentOne:{main:"#57467B",contrastText:"#fff"},accentTwo:{main:"#7CB4B8",contrastText:"#fff"},grey:{main:"#3f3e3e",contrastText:"#fff"},error:w.a,warning:x.a,first:b.a,contrastThreshold:3,tonalOffset:.2,text:h.a},T=Object(d.a)({typography:{fontFamily:'"Roboto", "Helvetica", "Arial", sans-serif',fontSize:13},palette:Object(u.a)({},E),overrides:{MuiButton:{root:{borderRadius:0},outlined:{borderRadius:0}},MuiTableCell:{head:{whiteSpace:"nowrap"},root:{whiteSpace:"nowrap"}},MuiPaper:{rounded:{borderRadius:0}},MuiTooltip:{tooltip:{borderRadius:0}}}}),k=Object(m.a)(T,{options:["xs","sm","md","lg","xl"],factor:3}),B=n(393),A=n(394),O=n(375),C=n(379),D=n(389),I=n(391),S=n(386),j=n(388),U=n(390),M=n(385),L=n(399),R=n(396),X=n(401),q=n(400),P=n(378),F=n(328),_=n(327),N=n(395),W=n(189),J=n.n(W),Y=n(192),z=n(120),H=n(381),V=n(384),Z=n(383),$=n(382),G=n(374),K=n(397),Q=n(380),ee=n(121),te=n(387),ne=n(188),ae=n.n(ne),re=n(185),oe=n.n(re),le=n(51),ie=n(44),se=n(186),ue=n(93),ce=n(119),pe="0x4470bb87d77b963a013db939be332f927f2b992e",de="0x46ad2d37ceaee1e82b70b867e674b903a4b4ca32",me=1e4,ye=3e4,be=Object(le.getDefaultProvider)(),fe=new le.Contract(de,ue,be),we=new le.Contract(pe,ce,be),ge=null,xe="https://min-api.cryptocompare.com/data/price?fsym=ADX&tsyms=BTC,USD,EUR",ve=30,he=[{label:"Validator Tom",id:Object(ie.id)("validator:0x2892f6C41E0718eeeDd49D98D648C789668cA67d"),selectable:!0},{label:"Validator Jerry",id:Object(ie.id)("validator:0xce07CbB7e054514D590a0262C93070D838bFBA2e"),selectable:!1}],Ee=Object(ie.bigNumberify)(0),Te={poolId:"",amount:Ee},ke={loaded:!1,userBonds:[],userBalance:Ee,totalStake:Ee};function Be(e){var t=e.title,n=e.subtitle,a=e.extra,o=e.loaded;return r.a.createElement(z.a,{elevation:3,style:{margin:k.spacing(1)}},r.a.createElement("div",{style:{padding:k.spacing(2),minHeight:"75px"}},r.a.createElement(ee.a,{variant:"h5"},n),a?r.a.createElement(ee.a,{color:"primary",variant:"h6"},a):r.a.createElement(r.a.Fragment,null),r.a.createElement(ee.a,{color:"textSecondary",variant:"subtitle2"},t)),o?r.a.createElement(r.a.Fragment,null):r.a.createElement(G.a,null))}function Ae(e){var t=e.stats,n=e.onRequestUnbond,o=e.onUnbond,l=t.userBonds.filter((function(e){return"Active"===e.status})).map((function(e){return e.amount})).reduce((function(e,t){return e.add(t)}),Ee),i=Object(a.useState)({}),s=Object(c.a)(i,2),u=s[0],p=s[1];Object(a.useEffect)((function(){fetch(xe).then((function(e){return e.json()})).then(p).catch(console.error)}),[]);var d=function(e){if(!e)return null;if(!u.USD)return null;var t=e.toNumber(10)/me*u.USD;return"".concat(t.toFixed(2)," USD")},m=r.a.createElement("div",{style:{display:"flex",alignItems:"center"}},r.a.createElement(ae.a,{style:{marginRight:k.spacing(2)}}),r.a.createElement("p",null,"This table will show all your individual ADX deposits (bonds), along with information as status, amount and earned reward. By using the action buttons, you will be able to request unbonding and withdraw your ADX after the ",ve," day lock-up period.")),y=!t.loaded||t.userBonds.length?r.a.createElement(r.a.Fragment,null):r.a.createElement(O.a,{item:!0,xs:12,style:{marginTop:k.spacing(2)}},r.a.createElement(te.a,{style:{fontSize:"15px",backgroundColor:k.palette.primary.main},message:m})),b={fontWeight:"bold"};return r.a.createElement(O.a,{container:!0,style:{padding:k.spacing(4),maxWidth:"1200px",margin:"auto"}},r.a.createElement(O.a,{item:!0,sm:3,xs:6},Be({loaded:t.loaded,title:"Total ADX staked",extra:d(t.totalStake),subtitle:Oe(t.totalStake)+" ADX"})),r.a.createElement(O.a,{item:!0,sm:3,xs:6},Be({loaded:t.loaded,title:"Your total active stake",extra:d(l),subtitle:Oe(l)+" ADX"})),r.a.createElement(O.a,{item:!0,sm:3,xs:6},Be({loaded:t.loaded,title:"Your balance",subtitle:t.userBalance?Oe(t.userBalance)+" ADX":"",extra:d(t.userBalance)})),r.a.createElement(O.a,{item:!0,sm:3,xs:6},Be({loaded:t.loaded,title:"Your total reward",extra:"0.00 USD",subtitle:"0.00 DAI"})),r.a.createElement(j.a,{xs:12},r.a.createElement(D.a,{"aria-label":"Bonds table",style:{marginTop:k.spacing(2)}},r.a.createElement(U.a,null,r.a.createElement(M.a,null,r.a.createElement(S.a,{style:b},"Bond amount"),r.a.createElement(S.a,{style:b,align:"right"},"Reward to collect"),r.a.createElement(S.a,{style:b,align:"right"},"Pool"),r.a.createElement(S.a,{style:b,align:"right"},"Status"),r.a.createElement(S.a,{style:b,align:"right"},"Actions"))),r.a.createElement(I.a,null,(t.userBonds||[]).map((function(e){var t=he.find((function(t){return t.id===e.poolId})),a=t?t.label:e.poolId;return r.a.createElement(M.a,{key:Ce(e)},r.a.createElement(S.a,null,Oe(e.amount)," ADX"),r.a.createElement(S.a,{align:"right"},"0.00 DAI"),r.a.createElement(S.a,{align:"right"},a),r.a.createElement(S.a,{align:"right"},function(e){if("UnbondRequested"===e.status){var t=e.willUnlock.getTime(),n=Date.now();if(t>n){var a=Math.ceil((t-n)/864e5);return"Can unbond in ".concat(a," days")}return"Can unbond"}return e.status}(e)),r.a.createElement(S.a,{align:"right"},"Active"===e.status?r.a.createElement(C.a,{color:"primary",onClick:function(){return n(e)}},"Request Unbond"):r.a.createElement(C.a,{disabled:e.willUnlock.getTime()>Date.now(),onClick:function(){return o(e)},color:"secondary"},"Unbond")))}))))),y)}function Oe(e){return(e.toNumber(10)/me).toFixed(2)}function Ce(e){var t=e.owner,n=e.amount,a=e.poolId,r=e.nonce;return Object(ie.keccak256)(ie.defaultAbiCoder.encode(["address","address","uint","bytes32","uint"],[de,t,n,a,r]))}function De(){var e,t;return s.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:if("undefined"===typeof window.ethereum){n.next=3;break}return n.next=3,s.a.awrap(window.ethereum.enable());case 3:if(window.web3){n.next=5;break}return n.abrupt("return",null);case 5:return e=new se.Web3Provider(window.web3.currentProvider),t=e.getSigner(),n.abrupt("return",t);case 8:case"end":return n.stop()}}))}function Ie(){var e,t,n,a,r,o,l;return s.a.async((function(i){for(;;)switch(i.prev=i.next){case 0:return i.next=2,s.a.awrap(De());case 2:if(e=i.sent){i.next=5;break}return i.abrupt("return",{loaded:!0,userBonds:[],userBalance:Ee});case 5:return i.next=7,s.a.awrap(e.getAddress());case 7:return t=i.sent,i.next=10,s.a.awrap(Promise.all([we.balanceOf(t),be.getLogs({fromBlock:0,address:de,topics:[null,Object(ie.hexZeroPad)(t,32)]})]));case 10:return n=i.sent,a=Object(c.a)(n,2),r=a[0],o=a[1],l=o.reduce((function(e,t){var n=t.topics[0],a=fe.interface.events;if(n===a.LogBond.topic){var r=fe.interface.parseLog(t).values,o={owner:r.owner,amount:r.amount,poolId:r.poolId,nonce:r.nonce};e.push(Object(u.a)({id:Ce(o),status:"Active"},o))}else if(n===a.LogUnbondRequested.topic){var l=fe.interface.parseLog(t).values,i=l.bondId,s=l.willUnlock,c=e.find((function(e){return e.id===i}));c.status="UnbondRequested",c.willUnlock=new Date(1e3*s)}else if(n===a.LogUnbonded.topic){var p=fe.interface.parseLog(t).values.bondId;e.find((function(e){return e.id===p})).status="Unbonded"}return e}),[]),i.abrupt("return",{loaded:!0,userBonds:l,userBalance:r});case 16:case"end":return i.stop()}}))}Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(r.a.createElement((function(){var e=Object(a.useState)(!1),t=Object(c.a)(e,2),n=t[0],o=t[1],l=r.a.useState(null),i=Object(c.a)(l,2),d=i[0],m=i[1],y=Object(a.useState)(ke),b=Object(c.a)(y,2),f=b[0],w=b[1],g=function(){return function(){var e,t,n,a;return s.a.async((function(r){for(;;)switch(r.prev=r.next){case 0:return r.next=2,s.a.awrap(Promise.all([we.balanceOf(de),Ie()]));case 2:return e=r.sent,t=Object(c.a)(e,2),n=t[0],a=t[1],r.abrupt("return",Object(u.a)({totalStake:n},a));case 7:case"end":return r.stop()}}))}().then(w).catch((function(e){return console.error("loadStats",e)}))};Object(a.useEffect)((function(){g();var e=setInterval(g,ye);return function(){return clearInterval(e)}}),[]);var x=function(e){return function(t){var n,a,r,o,l,i,u;return s.a.async((function(c){for(;;)switch(c.prev=c.next){case 0:return n=t.amount,a=t.poolId,r=t.nonce,c.next=3,s.a.awrap(De());case 3:if(o=c.sent){c.next=6;break}return c.abrupt("return");case 6:return l=new le.Contract(de,ue,o),i=e?l.unbond.bind(l):l.requestUnbond.bind(l),c.next=10,s.a.awrap(i([n,a,r||Ee]));case 10:return u=c.sent,c.next=13,s.a.awrap(u.wait());case 13:case"end":return c.stop()}}))}},v=x(!1),h=x(!0);return r.a.createElement(p.a,{theme:k},r.a.createElement(B.a,{position:"static"},r.a.createElement(A.a,null,r.a.createElement("img",{height:"40vh",src:oe.a,alt:"logo"}),r.a.createElement(N.a,{disabled:!f.loaded,onClick:function(){return o(!0)},variant:"extended",color:"secondary",style:{position:"absolute",right:"5%",top:"50%"}},r.a.createElement(J.a,{style:{margin:k.spacing(1)}}),"Stake your ADX"))),Ae({stats:f,onRequestUnbond:m,onUnbond:h}),function(e){var t=e.toUnbond,n=e.onDeny,a=e.onConfirm;return r.a.createElement(H.a,{open:!!t,onClose:n},r.a.createElement($.a,{id:"alert-dialog-title"},"Are you sure?"),r.a.createElement(Z.a,null,"Are you sure you want to request unbonding of"," ",Oe(t?t.amount:Ee)," ADX?",r.a.createElement("br",null),r.a.createElement("br",null),"Please be aware:",r.a.createElement("ol",null,r.a.createElement("li",null,"It will take ",ve," days before you will be able to withdraw your ADX!"),r.a.createElement("li",null,"You will not receive staking rewards for this amount in this period."))),r.a.createElement(V.a,null,r.a.createElement(C.a,{onClick:n,autoFocus:!0,color:"primary"},"Cancel"),r.a.createElement(C.a,{onClick:a,color:"primary"},"Unbond")))}({toUnbond:d,onDeny:function(){return m(null)},onConfirm:function(){d&&v(d),m(null)}}),r.a.createElement(F.a,{open:n,onClose:function(){return o(!1)},style:{display:"flex",alignItems:"center",justifyContent:"center"},closeAfterTransition:!0,BackdropComponent:_.a,BackdropProps:{timeout:300}},r.a.createElement(Y.a,{in:n},function(e){var t=e.maxAmount,n=e.onNewBond,o=e.pools,l=Object(a.useState)(Te),i=Object(c.a)(l,2),s=i[0],p=i[1],d=Object(a.useState)(!1),m=Object(c.a)(d,2),y=m[0],b=m[1],f={minWidth:"180px"},w=ge?r.a.createElement(r.a.Fragment,null,"\xa0and"," ",r.a.createElement("a",{target:"_blank",href:ge},"staking conditions")):r.a.createElement(r.a.Fragment,null),g=r.a.createElement(r.a.Fragment,null,"I understand I am locking up my ADX for at least ",ve," days and I am familiar with the\xa0",r.a.createElement("a",{href:"https://www.adex.network/tos/",target:"_blank"},"Terms and conditions"),w,".");return r.a.createElement(z.a,{elevation:2,style:{width:"500px",padding:k.spacing(2,4,3)}},r.a.createElement("h2",null,"Create a bond"),r.a.createElement(O.a,{container:!0,spacing:2},r.a.createElement(O.a,{item:!0,xs:6},r.a.createElement(L.a,{required:!0,label:"ADX amount",type:"number",style:f,value:s.amount.toNumber()/me,onChange:function(e){return p(Object(u.a)({},s,{amount:(n=t,a=Object(ie.bigNumberify)(Math.abs(Math.floor(e.target.value*me))),n.lt(a)?n:a)}));var n,a}}),r.a.createElement(ee.a,{variant:"subtitle2"},"Max amount:",r.a.createElement(C.a,{onClick:function(e){return p(Object(u.a)({},s,{amount:t}))}},Oe(t)," ADX"))),r.a.createElement(O.a,{item:!0,xs:6},r.a.createElement(P.a,{required:!0},r.a.createElement(q.a,null,"Pool"),r.a.createElement(R.a,{style:f,value:s.poolId,onChange:function(e){return p(Object(u.a)({},s,{poolId:e.target.value}))}},r.a.createElement(X.a,{value:""},r.a.createElement("em",null,"None")),o.map((function(e){var t=e.label,n=e.id;return r.a.createElement(X.a,{key:n,value:n},t)}))))),r.a.createElement(O.a,{item:!0,xs:12},r.a.createElement(Q.a,{style:{userSelect:"none"},label:g,control:r.a.createElement(K.a,{checked:y,onChange:function(e){return b(e.target.checked)}})})),r.a.createElement(O.a,{item:!0,xs:12},r.a.createElement(P.a,{style:{display:"flex"}},r.a.createElement(C.a,{disabled:!(s.poolId&&y&&s.amount.gt(Ee)),color:"primary",variant:"contained",onClick:function(){b(!1),n(s)}},"Stake ADX")))))}({pools:he.filter((function(e){return e.selectable})),maxAmount:f.userBalance,onNewBond:function(e){o(!1),function(e,t){var n,a,r,o,l,i,u,c;s.a.async((function(p){for(;;)switch(p.prev=p.next){case 0:if(n=t.amount,a=t.poolId,r=t.nonce,a){p.next=3;break}return p.abrupt("return");case 3:if(e.userBalance){p.next=5;break}return p.abrupt("return");case 5:if(!n.gt(e.userBalance)){p.next=7;break}return p.abrupt("return");case 7:return p.next=9,s.a.awrap(De());case 9:if(o=p.sent){p.next=12;break}return p.abrupt("return");case 12:return l=new le.Contract(de,ue,o),i=new le.Contract(pe,ce,o),p.t0=s.a,p.t1=i,p.next=18,s.a.awrap(o.getAddress());case 18:return p.t2=p.sent,p.t3=de,p.t4=p.t1.allowance.call(p.t1,p.t2,p.t3),p.next=23,p.t0.awrap.call(p.t0,p.t4);case 23:if(u=p.sent,c=[],u.eq(n)){p.next=37;break}if(!u.gt(Ee)){p.next=32;break}return p.t5=c,p.next=30,s.a.awrap(i.approve(de,Ee,{gasLimit:8e4}));case 30:p.t6=p.sent,p.t5.push.call(p.t5,p.t6);case 32:return p.t7=c,p.next=35,s.a.awrap(i.approve(de,n,{gasLimit:8e4}));case 35:p.t8=p.sent,p.t7.push.call(p.t7,p.t8);case 37:return p.t9=c,p.next=40,s.a.awrap(l.addBond([n,a,r||Ee],{gasLimit:11e4}));case 40:return p.t10=p.sent,p.t9.push.call(p.t9,p.t10),p.next=44,s.a.awrap(Promise.all(c.map((function(e){return e.wait()}))));case 44:case"end":return p.stop()}}))}(f,e)}}))))}),null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))},93:function(e){e.exports=JSON.parse('[{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"slasher","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"poolId","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"nonce","type":"uint256"},{"indexed":false,"internalType":"uint64","name":"slashedAtStart","type":"uint64"}],"name":"LogBond","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"poolId","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"newSlashPts","type":"uint256"}],"name":"LogSlash","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"bytes32","name":"bondId","type":"bytes32"},{"indexed":false,"internalType":"uint64","name":"willUnlock","type":"uint64"}],"name":"LogUnbondRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"bytes32","name":"bondId","type":"bytes32"}],"name":"LogUnbonded","type":"event"},{"constant":false,"inputs":[{"components":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes32","name":"poolId","type":"bytes32"},{"internalType":"uint256","name":"nonce","type":"uint256"}],"internalType":"struct BondLibrary.Bond","name":"bond","type":"tuple"}],"name":"addBond","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"bonds","outputs":[{"internalType":"bool","name":"active","type":"bool"},{"internalType":"uint64","name":"slashedAtStart","type":"uint64"},{"internalType":"uint64","name":"willUnlock","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"components":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes32","name":"poolId","type":"bytes32"},{"internalType":"uint256","name":"nonce","type":"uint256"}],"internalType":"struct BondLibrary.Bond","name":"bond","type":"tuple"}],"name":"getWithdrawAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"components":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes32","name":"poolId","type":"bytes32"},{"internalType":"uint256","name":"nonce","type":"uint256"}],"internalType":"struct BondLibrary.Bond","name":"bond","type":"tuple"}],"name":"requestUnbond","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"poolId","type":"bytes32"},{"internalType":"uint256","name":"pts","type":"uint256"}],"name":"slash","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"slashPoints","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"slasherAddr","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenAddr","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"components":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes32","name":"poolId","type":"bytes32"},{"internalType":"uint256","name":"nonce","type":"uint256"}],"internalType":"struct BondLibrary.Bond","name":"bond","type":"tuple"}],"name":"unbond","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]')}},[[201,1,2]]]);
//# sourceMappingURL=main.16942e02.chunk.js.map