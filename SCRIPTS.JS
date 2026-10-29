/* ===================================================================
   EduVault — SCRIPTS.JS
   Vanilla JS: sample data, rendering, interactions, quiz, AI demo,
               role switching, persistence, modal, toasts.
   =================================================================== */
(function(){
  "use strict";

  /* ---------------- Utilities ---------------- */
  const $  = (sel,ctx=document)=>ctx.querySelector(sel);
  const $$ = (sel,ctx=document)=>Array.from(ctx.querySelectorAll(sel));
  const el = (tag,attrs={},html="")=>{const e=document.createElement(tag);for(const k in attrs){if(k==="class")e.className=attrs[k];else if(k==="dataset")Object.assign(e.dataset,attrs[k]);else e.setAttribute(k,attrs[k]);}if(html)e.innerHTML=html;return e;};
  const esc = (s)=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fmtDate = (d)=>new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
  const uid = ()=>Math.random().toString(36).slice(2,9);

  const Store = {
    get(key,fallback){
      try{const v=localStorage.getItem("eduvault_"+key);return v==null?fallback:JSON.parse(v);}catch(e){return fallback;}
    },
    set(key,val){try{localStorage.setItem("eduvault_"+key,JSON.stringify(val));}catch(e){}},
    remove(key){try{localStorage.removeItem("eduvault_"+key);}catch(e){}},
    clearAll(){Object.keys(localStorage).filter(k=>k.startsWith("eduvault_")).forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});}
  };

  /* ---------------- Sample Data ---------------- */
  const branches = ["Computer Science","Electronics","Mechanical","Civil","Information Science"];
  const subjects = [
    {id:"sub1",name:"Programming in C",code:"CS101",sem:"sem1"},
    {id:"sub2",name:"Mathematics-I",code:"MA101",sem:"sem1"},
    {id:"sub3",name:"Physics",code:"PH101",sem:"sem1"},
    {id:"sub4",name:"Basic Electrical",code:"EE101",sem:"sem1"},
    {id:"sub5",name:"Communication Skills",code:"HU101",sem:"sem1"},
    {id:"sub6",name:"Data Structures",code:"CS201",sem:"sem2"},
    {id:"sub7",name:"Mathematics-II",code:"MA201",sem:"sem2"}
  ];
  const categories = ["Notes","Previous Papers","Model Papers","Laboratory Programs","Assignments","Reference Materials"];

  const resources = [
    {id:1,title:"Introduction to C Programming — Unit 1 Notes",subject:"sub1",sem:"sem1",category:"Notes",format:"PDF",date:"2025-08-12",uploader:"Prof. R. Mehta",branch:"Computer Science",year:"1"},
    {id:2,title:"Arrays and Pointers — Complete Notes",subject:"sub1",sem:"sem1",category:"Notes",format:"PDF",date:"2025-09-02",uploader:"Prof. R. Mehta",branch:"Computer Science",year:"1"},
    {id:3,title:"C Programming — Model Question Paper Set 1",subject:"sub1",sem:"sem1",category:"Model Papers",format:"DOCX",date:"2025-09-15",uploader:"Prof. R. Mehta",branch:"Computer Science",year:"1"},
    {id:4,title:"C Programming — Previous Year Paper 2023",subject:"sub1",sem:"sem1",category:"Previous Papers",format:"PDF",date:"2025-01-10",uploader:"Exam Cell",branch:"Computer Science",year:"1"},
    {id:5,title:"Lab 01: Hello World & Variable Scope",subject:"sub1",sem:"sem1",category:"Laboratory Programs",format:"LAB",date:"2025-08-20",uploader:"Lab Asst. S. Rao",branch:"Computer Science",year:"1"},
    {id:6,title:"Lab 02: Functions and Recursion",subject:"sub1",sem:"sem1",category:"Laboratory Programs",format:"LAB",date:"2025-08-27",uploader:"Lab Asst. S. Rao",branch:"Computer Science",year:"1"},
    {id:7,title:"Lab 03: Arrays and Strings",subject:"sub1",sem:"sem1",category:"Laboratory Programs",format:"LAB",date:"2025-09-03",uploader:"Lab Asst. S. Rao",branch:"Computer Science",year:"1"},
    {id:8,title:"Differential Calculus — Notes",subject:"sub2",sem:"sem1",category:"Notes",format:"PDF",date:"2025-08-14",uploader:"Prof. A. Nair",branch:"Computer Science",year:"1"},
    {id:9,title:"Mathematics-I Model Paper",subject:"sub2",sem:"sem1",category:"Model Papers",format:"DOCX",date:"2025-09-18",uploader:"Prof. A. Nair",branch:"Computer Science",year:"1"},
    {id:10,title:"Mathematics-I Previous Paper 2022",subject:"sub2",sem:"sem1",category:"Previous Papers",format:"PDF",date:"2025-01-08",uploader:"Exam Cell",branch:"Computer Science",year:"1"},
    {id:11,title:"Optics & Wave Optics — Reference Material",subject:"sub3",sem:"sem1",category:"Reference Materials",format:"PDF",date:"2025-08-22",uploader:"Prof. K. Das",branch:"Electronics",year:"1"},
    {id:12,title:"Physics Lab 01: Oscilloscope Basics",subject:"sub3",sem:"sem1",category:"Laboratory Programs",format:"LAB",date:"2025-08-25",uploader:"Lab Asst. M. Pillai",branch:"Electronics",year:"1"},
    {id:13,title:"Ohm's Law & Kirchhoff's Laws — Notes",subject:"sub4",sem:"sem1",category:"Notes",format:"PDF",date:"2025-08-30",uploader:"Prof. S. Banerjee",branch:"Electronics",year:"1"},
    {id:14,title:"Effective Communication — Reference Guide",subject:"sub5",sem:"sem1",category:"Reference Materials",format:"PPTX",date:"2025-09-05",uploader:"Dr. L. Fernandes",branch:"Computer Science",year:"1"},
    {id:15,title:"Data Structures — Arrays & Linked Lists",subject:"sub6",sem:"sem2",category:"Notes",format:"PDF",date:"2025-10-02",uploader:"Prof. R. Mehta",branch:"Computer Science",year:"1"},
    {id:16,title:"Stacks & Queues — Lab Program",subject:"sub6",sem:"sem2",category:"Laboratory Programs",format:"LAB",date:"2025-10-12",uploader:"Lab Asst. S. Rao",branch:"Computer Science",year:"1"}
  ];

  const assignments = [
    {id:1,title:"Write a C program to implement a calculator",subject:"sub1",desc:"Create a menu-driven calculator supporting addition, subtraction, multiplication and division using functions.",assigned:"2025-10-15",due:"2025-11-05",status:"Pending",priority:"high"},
    {id:2,title:"Solve Differential Calculus problem set",subject:"sub2",desc:"Complete problems 1–12 from Chapter 3 on limits and derivatives.",assigned:"2025-10-18",due:"2025-10-30",status:"Pending",priority:"high"},
    {id:3,title:"Lab report: Oscilloscope measurements",subject:"sub3",desc:"Document observations from Lab 01 with circuit diagrams and readings.",assigned:"2025-10-08",due:"2025-10-25",status:"Submitted",priority:"medium"},
    {id:4,title:"Communication Skills presentation",subject:"sub5",desc:"Prepare a 5-minute presentation on a technical topic of your choice.",assigned:"2025-10-01",due:"2025-10-20",status:"Completed",priority:"medium"},
    {id:5,title:"Ohm's Law numerical worksheet",subject:"sub4",desc:"Solve the 10 numericals provided in the reference material.",assigned:"2025-10-20",due:"2025-11-08",status:"Pending",priority:"low"},
    {id:6,title:"Linked List implementation",subject:"sub6",desc:"Implement singly and doubly linked lists with insertion and deletion.",assigned:"2025-10-22",due:"2025-11-12",status:"Pending",priority:"medium"}
  ];

  const announcements = [
    {id:1,title:"Mid-Semester Examinations Schedule Released",dept:"Examination Cell",date:"2025-10-26",priority:"Important",desc:"The mid-semester examinations will commence from November 18. Please check the detailed timetable on the notice board.",read:false},
    {id:2,title:"C Programming Lab rescheduled",dept:"Computer Science Dept.",date:"2025-10-24",priority:"Normal",desc:"The Friday lab session is moved to Saturday 10 AM due to a faculty workshop.",read:false},
    {id:3,title:"Library extended hours during exam weeks",dept:"Library",date:"2025-10-22",priority:"Normal",desc:"The library will remain open until 9 PM from November 1 to November 20.",read:true},
    {id:4,title:"Industry guest lecture on Data Structures",dept:"Placement Cell",date:"2025-10-20",priority:"Important",desc:"A guest lecture by a senior engineer from a leading tech company on real-world data structures usage.",read:false},
    {id:5,title:"Assignment submission portal maintenance",dept:"IT Services",date:"2025-10-18",priority:"Normal",desc:"The submission portal will be unavailable on Sunday 2–4 AM for scheduled maintenance.",read:true}
  ];

  const notifications = [
    {id:1,icon:"info",text:"New resource added: Arrays and Pointers Notes",time:"2h ago",annId:2},
    {id:2,icon:"warn",text:"Assignment due in 2 days: Differential Calculus",time:"5h ago"},
    {id:3,icon:"ok",text:"Your practice test score improved by 5%",time:"1d ago"},
    {id:4,icon:"info",text:"Mid-semester schedule released",time:"1d ago",annId:1},
    {id:5,icon:"info",text:"Guest lecture on Data Structures announced",time:"2d ago",annId:4}
  ];

  const activity = [
    {type:"view",text:"Viewed C Programming — Unit 1 Notes",time:"2025-10-28 14:20",color:"var(--indigo-400)"},
    {type:"download",text:"Downloaded Mathematics-I Model Paper",time:"2025-10-28 11:05",color:"var(--success)"},
    {type:"complete",text:"Completed Communication Skills presentation",time:"2025-10-27 16:40",color:"var(--violet-500)"},
    {type:"view",text:"Opened Lab 02: Functions and Recursion",time:"2025-10-27 09:15",color:"var(--indigo-400)"},
    {type:"test",text:"Scored 80% in C Programming Practice Test",time:"2025-10-26 18:00",color:"var(--success)"}
  ];

  const quickAccess = [
    {label:"Notes",icon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/><path d="M13 3v5h5"/></svg>',color:"var(--indigo-400)",nav:"resources"},
    {label:"Previous Papers",icon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M14 3v6h6"/></svg>',color:"#e2574b",nav:"papers"},
    {label:"Model Papers",icon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>',color:"var(--violet-500)",nav:"resources"},
    {label:"Lab Programs",icon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3"/></svg>',color:"var(--success)",nav:"labs"},
    {label:"Assignments",icon:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5h6M5 2h14v20l-7-4-7 4V2z"/></svg>',color:"var(--warning)",nav:"assignments"}
  ];

  const continueLearning = [
    {title:"C Programming — Unit 2 Notes",sub:"Programming in C",pct:65},
    {title:"Differential Calculus",sub:"Mathematics-I",pct:40},
    {title:"Lab 02: Functions",sub:"Programming in C",pct:80},
    {title:"Ohm's Law Notes",sub:"Basic Electrical",pct:25}
  ];

  /* ---- Quiz data ---- */
  const tests = [
    {id:1,title:"C Programming Basics",subject:"Programming in C",topic:"C Fundamentals",qcount:5,duration:300,difficulty:"easy",
      questions:[
        {q:"Which header file is required for printf()?",opts:["<stdlib.h>","<stdio.h>","<string.h>","<conio.h>"],ans:1,topic:"Headers"},
        {q:"What is the size of int in a typical 32-bit system?",opts:["2 bytes","4 bytes","8 bytes","1 byte"],ans:1,topic:"Data Types"},
        {q:"Which operator is used for address of a variable?",opts:["*","&","->","."],ans:1,topic:"Pointers"},
        {q:"Which loop executes at least once?",opts:["for","while","do-while","if"],ans:2,topic:"Loops"},
        {q:"What does %d format specifier print?",opts:["float","string","integer","char"],ans:2,topic:"I/O"}
      ]},
    {id:2,title:"Mathematics-I: Calculus",subject:"Mathematics-I",topic:"Differential Calculus",qcount:5,duration:360,difficulty:"medium",
      questions:[
        {q:"Derivative of sin(x) is?",opts:["cos(x)","-cos(x)","-sin(x)","tan(x)"],ans:0,topic:"Trigonometric"},
        {q:"d/dx(x^n) equals?",opts:["nx^(n-1)","x^(n-1)","n*x^n","n!"],ans:0,topic:"Power Rule"},
        {q:"Limit of (sin x)/x as x→0 is?",opts:["0","1","∞","undefined"],ans:1,topic:"Limits"},
        {q:"Derivative of e^x is?",opts:["x*e^x","e^x","1","x"],ans:1,topic:"Exponential"},
        {q:"d/dx(ln x) equals?",opts:["1/x","x","ln x","e^x"],ans:0,topic:"Logarithmic"}
      ]},
    {id:3,title:"Data Structures Fundamentals",subject:"Data Structures",topic:"Arrays & Lists",qcount:5,duration:300,difficulty:"medium",
      questions:[
        {q:"Time complexity of array access by index?",opts:["O(n)","O(1)","O(log n)","O(n^2)"],ans:1,topic:"Arrays"},
        {q:"A linked list node contains?",opts:["data only","pointer only","data and pointer","none"],ans:2,topic:"Linked Lists"},
        {q:"Stack follows which principle?",opts:["FIFO","LIFO","Random","Priority"],ans:1,topic:"Stacks"},
        {q:"Queue follows which principle?",opts:["FIFO","LIFO","Random","Priority"],ans:0,topic:"Queues"},
        {q:"Insertion at head of singly linked list is?",opts:["O(n)","O(1)","O(log n)","O(n^2)"],ans:1,topic:"Linked Lists"}
      ]}
  ];

  /* ---- AI demo responses ---- */
  const aiResponses = [
    {match:/binary|number system/i,reply:"The binary number system uses only two digits: 0 and 1. Each position represents a power of 2. For example, the binary number 1011 equals (1×8)+(0×4)+(1×2)+(1×1) = 11 in decimal.\n\nBinary is fundamental to computing because digital circuits use two voltage states, which map cleanly to 0 and 1.",source:"C Programming — Unit 1 Notes (demonstration)"},
    {match:/data structures|summar.*notes/i,reply:"Summary of data structures notes:\n1. Arrays store elements contiguously, offering O(1) indexed access.\n2. Linked lists use nodes with pointers, enabling O(1) insertion at the head.\n3. Stacks are LIFO; queues are FIFO.\n4. Choosing a structure depends on the operations you need most often.",source:"Data Structures Notes (demonstration)"},
    {match:/practice question|generate.*question/i,reply:"Five practice questions on C programming:\n1. What is the difference between = and ==?\n2. Explain the purpose of a header file.\n3. Write a function to reverse a string.\n4. What is a pointer and how is it declared?\n5. Differentiate between while and do-while loops.",source:"Generated from syllabus topics (demonstration)"},
    {match:/question paper|paper pattern/i,reply:"The previous question paper for Mathematics typically contains:\n- Part A: 10 short-answer questions (2 marks each)\n- Part B: 5 long-answer questions (choosing from 7, 12 marks each)\n\nFocus areas based on past papers: differentiation, integration, and limits.",source:"Mathematics-I Previous Paper 2022 (demonstration)"},
    {match:/laboratory|lab program|swap/i,reply:"Lab program — Swapping two numbers, step by step:\n1. Declare two variables a and b.\n2. Use a temporary variable temp = a.\n3. Set a = b.\n4. Set b = temp.\n5. Print the swapped values.\n\nWithout a temp variable, you can use a = a + b; b = a - b; a = a - b;.",source:"C Lab 01 Notes (demonstration)"},
    {match:/pointer|recursion|function/i,reply:"Pointers store memory addresses. Recursion is a function calling itself with a smaller subproblem until a base case is reached.\n\nExample: factorial(n) = n * factorial(n-1), with base case factorial(0) = 1. Watch for stack overflow with deep recursion.",source:"C Programming — Unit 2 Notes (demonstration)"}
  ];
  const aiFallback = "I can help with that topic. This is a demonstration response — in the full version, this answer would be generated by a connected AI model using verified syllabus materials. Try asking about binary numbers, data structures, or generating practice questions.";

  /* ---- Progress (demo) ---- */
  const progressData = {
    testHistory:[
      {name:"C Programming Basics",score:80,date:"2025-10-26"},
      {name:"Mathematics-I: Calculus",score:60,date:"2025-10-20"},
      {name:"Data Structures Fundamentals",score:70,date:"2025-10-15"},
      {name:"C Programming Basics",score:90,date:"2025-10-10"},
      {name:"Physics Basics",score:85,date:"2025-10-05"}
    ],
    subjectPerf:[{name:"Programming in C",score:85},{name:"Mathematics-I",score:60},{name:"Physics",score:72},{name:"Data Structures",score:70}],
    topicPerf:[
      {topic:"Pointers",score:45,status:"improve"},
      {topic:"Loops",score:88,status:"strength"},
      {topic:"Limits",score:55,status:"improve"},
      {topic:"Arrays",score:90,status:"strength"},
      {topic:"Functions",score:82,status:"strength"}
    ]
  };

  /* ---------------- State ---------------- */
  let state = {
    role:"student",
    currentView:"overview",
    resourceLayout:Store.get("defaultView","grid"),
    bookmarks:Store.get("bookmarks",[]),
    asgStatuses:Store.get("asgStatuses",{}),
    annRead:Store.get("annRead",[]),
    notifRead:Store.get("notifRead",false),
    chat:Store.get("chat",[]),
    quiz:{active:false,test:null,answers:[],current:0,timer:null,remaining:0,submitted:false},
    preferences:Store.get("prefs",{compact:false,reducedMotion:false,defaultView:"grid"})
  };

  /* ---------------- Toast ---------------- */
  function toast(message,type="info",subtitle){
    const stack=$("#toastStack");
    const icons={success:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>',warning:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>',error:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>',info:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>'};
    const t=el("div",{class:"toast "+type});
    t.innerHTML='<span class="toast-ic">'+(icons[type]||icons.info)+'</span><div class="toast-body"><p>'+esc(message)+'</p>'+(subtitle?'<span>'+esc(subtitle)+'</span>':'')+'</div><button class="toast-close" aria-label="Dismiss">&times;</button>';
    stack.appendChild(t);
    const close=()=>{t.classList.add("out");setTimeout(()=>t.remove(),300);};
    t.querySelector(".toast-close").addEventListener("click",close);
    setTimeout(close,4000);
  }

  /* ---------------- Modal ---------------- */
  function modal(title,bodyHtml,footHtml){
    const m=$("#modal");
    $("#modalTitle").textContent=title;
    $("#modalBody").innerHTML=bodyHtml;
    $("#modalFoot").innerHTML=footHtml||"";
    m.hidden=false;
    document.body.style.overflow="hidden";
  }
  function closeModal(){
    $("#modal").hidden=true;
    $("#modalBody").innerHTML="";
    $("#modalFoot").innerHTML="";
    document.body.style.overflow="";
  }
  function confirmModal(title,message,onConfirm,confirmText="Confirm",danger=false){
    modal(title,"<p style='color:var(--ink-600)'>"+esc(message)+"</p>",
      "<button class='btn ghost' data-close>Cancel</button><button class='btn "+(danger?"danger-ghost":"primary")+"' data-confirm>"+esc(confirmText)+"</button>");
    $("[data-confirm]",$("#modalFoot")).addEventListener("click",()=>{closeModal();onConfirm();});
    $("[data-close]",$("#modalFoot")).addEventListener("click",closeModal);
  }
  $("#modalClose").addEventListener("click",closeModal);
  $("#modalBackdrop").addEventListener("click",closeModal);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#modal").hidden)closeModal();});

  /* ---------------- Navigation ---------------- */
  const navMeta={
    overview:{title:"Overview",crumb:"Home / Overview"},
    resources:{title:"Study Resources",crumb:"Home / Study Resources"},
    papers:{title:"Previous Question Papers",crumb:"Home / Previous Papers"},
    labs:{title:"Laboratory Programs",crumb:"Home / Laboratory Programs"},
    assignments:{title:"Assignments",crumb:"Home / Assignments"},
    assistant:{title:"AI Study Assistant",crumb:"Home / AI Assistant"},
    tests:{title:"Practice Tests",crumb:"Home / Practice Tests"},
    progress:{title:"My Progress",crumb:"Home / My Progress"},
    announcements:{title:"Announcements",crumb:"Home / Announcements"},
    faculty:{title:"Faculty Console",crumb:"Home / Faculty Console"},
    help:{title:"Help & Support",crumb:"Home / Help & Support"},
    settings:{title:"Settings",crumb:"Home / Settings"}
  };

  function navigate(view){
    if(!navMeta[view])return;
    state.currentView=view;
    $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.nav===view));
    $$(".view").forEach(s=>{s.hidden=s.id!=="view-"+view;s.classList.toggle("active",s.id==="view-"+view);});
    $("#pageTitle").textContent=navMeta[view].title;
    $("#pageBreadcrumb").textContent=navMeta[view].crumb;
    closeSidebar();
    window.scrollTo(0,0);
    if(view==="assistant")renderChat();
    if(view==="faculty")renderFacultyResources();
    if(view==="progress")renderProgress();
    if(view==="tests")renderTests();
    if(view==="announcements")renderAnnouncements();
  }

  $$(".nav-item").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.nav)));
  $$("[data-nav]").forEach(b=>{if(b.classList.contains("nav-item"))return;b.addEventListener("click",e=>{e.preventDefault();navigate(b.dataset.nav);});});

  /* ---------------- Sidebar mobile ---------------- */
  function openSidebar(){$("#sidebar").classList.add("open");$("#sidebarBackdrop").hidden=false;$("#menuToggle").setAttribute("aria-expanded","true");}
  function closeSidebar(){$("#sidebar").classList.remove("open");$("#sidebarBackdrop").hidden=true;$("#menuToggle").setAttribute("aria-expanded","false");}
  $("#menuToggle").addEventListener("click",openSidebar);
  $("#sidebarClose").addEventListener("click",closeSidebar);
  $("#sidebarBackdrop").addEventListener("click",closeSidebar);

  /* ---------------- Role switching ---------------- */
  function setRole(role){
    state.role=role;
    $$(".role-btn").forEach(b=>{const a=b.dataset.role===role;b.classList.toggle("active",a);b.setAttribute("aria-pressed",a);});
    document.body.classList.toggle("is-faculty",role==="faculty");
    $("#userRoleIndicator").textContent=role==="faculty"?"Faculty":"Student";
    $(".user-name",$("#userCard")).textContent=role==="faculty"?"Prof. R. Mehta":"Aarav Sharma";
    $(".profile-name").textContent=role==="faculty"?"Prof. R.":"Aarav S.";
    $(".avatar",$("#userCard")).textContent=role==="faculty"?"RM":"AS";
    $$(".avatar",$("#profileDropdown")).forEach(a=>a.textContent=role==="faculty"?"RM":"AS");
    $(".user-name",$("#profileDropdown")).textContent=role==="faculty"?"Prof. R. Mehta":"Aarav Sharma";
    $(".user-email").textContent=role==="faculty"?"r.mehta@eduvault.edu":"aarav.s@eduvault.edu";
    if(role==="faculty")navigate("faculty");else navigate("overview");
    toast(role==="faculty"?"Faculty demo mode enabled":"Student demo mode enabled","info");
  }
  $$(".role-btn").forEach(b=>b.addEventListener("click",()=>setRole(b.dataset.role)));

  /* ---------------- Overview ---------------- */
  function renderOverview(){
    const greetEl=$("#heroGreet");
    const hr=new Date().getHours();
    greetEl.textContent=(hr<12?"Good morning":hr<17?"Good afternoon":"Good evening")+", "+(state.role==="faculty"?"Professor":"Aarav");

    const cl=$("#continueList");
    cl.innerHTML="";
    continueLearning.forEach(c=>{
      const item=el("div",{class:"continue-item",role:"button",tabindex:"0"});
      item.innerHTML='<span class="continue-thumb">'+esc(c.title.charAt(0))+'</span><div class="continue-meta"><p>'+esc(c.title)+'</p><p class="muted">'+esc(c.sub)+'</p><div class="progress-mini"><span style="width:'+c.pct+'%"></span></div></div><span class="continue-pct">'+c.pct+'%</span>';
      item.addEventListener("click",()=>navigate("resources"));
      cl.appendChild(item);
    });

    const qa=$("#quickAccess");
    qa.innerHTML="";
    quickAccess.forEach(q=>{
      const b=el("button",{class:"quick-card"});
      b.innerHTML='<span class="quick-ic" style="background:'+q.color+'22;color:'+q.color+'">'+q.icon+'</span><span>'+esc(q.label)+'</span>';
      b.addEventListener("click",()=>navigate(q.nav));
      qa.appendChild(b);
    });

    const dl=$("#deadlineList");
    dl.innerHTML="";
    assignments.slice(0,4).forEach(a=>{
      const st=state.asgStatuses[a.id]||a.status;
      const overdue=st!=="Completed"&&new Date(a.due)<new Date();
      const item=el("div",{class:"row-item"});
      item.innerHTML='<div class="row-ic" style="background:'+(overdue?"var(--error-bg)":"var(--warning-bg)")+';color:'+(overdue?"var(--error)":"var(--warning)")+'"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div><div class="row-main"><p class="t">'+esc(a.title)+'</p><p class="muted">'+esc(subjectName(a.subject))+' · Due '+fmtDate(a.due)+'</p></div><span class="row-tag '+(overdue?"tag-overdue":"tag-"+st.toLowerCase())+'">'+(overdue?"Overdue":st)+'</span>';
      item.addEventListener("click",()=>navigate("assignments"));
      dl.appendChild(item);
    });

    const ra=$("#recentAnnouncements");
    ra.innerHTML="";
    announcements.slice(0,3).forEach(a=>{
      const item=el("div",{class:"row-item",role:"button",tabindex:"0"});
      item.innerHTML='<div class="row-ic" style="background:'+(a.priority==="Important"?"var(--error-bg)":"var(--indigo-400)")+'22;color:'+(a.priority==="Important"?"var(--error)":"var(--indigo-600)")+'"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l6-7v16l-6-7v-2zM14 8a5 5 0 010 8"/></svg></div><div class="row-main"><p class="t">'+esc(a.title)+'</p><p class="muted">'+esc(a.dept)+' · '+fmtDate(a.date)+'</p></div>'+(a.priority==="Important"?'<span class="row-tag tag-important">Important</span>':"");
      item.addEventListener("click",()=>navigate("announcements"));
      ra.appendChild(item);
    });

    const rec=$("#recommendedList");
    rec.innerHTML="";
    const recs=resources.filter(r=>r.category==="Notes"||r.category==="Reference Materials").slice(0,4);
    recs.forEach(r=>{const item=el("div",{class:"row-item",role:"button",tabindex:"0"});item.innerHTML=resourceRowHtml(r);item.addEventListener("click",()=>openResourcePreview(r));rec.appendChild(item);});

    const act=$("#recentActivity");
    act.innerHTML="";
    activity.forEach(a=>{
      const item=el("div",{class:"activity-item"});
      item.innerHTML='<span class="activity-dot" style="background:'+a.color+'"></span><div class="activity-meta"><p>'+esc(a.text)+'</p><time>'+esc(a.time)+'</time></div>';
      act.appendChild(item);
    });
  }

  /* ---------------- Resources ---------------- */
  function subjectName(id){return (subjects.find(s=>s.id===id)||{}).name||"—";}

  function resourceRowHtml(r){
    return '<div class="res-top"><div class="res-icon fmt-'+r.format+'">'+esc(r.format)+'</div><div><p class="res-title">'+esc(r.title)+'</p><p class="res-sub">'+esc(subjectName(r.subject))+'</p></div></div>'+
      '<div class="res-meta"><span>'+esc(r.category)+'</span><span>Sem '+r.sem.replace("sem","")+'</span><span>'+esc(r.format)+'</span><span>'+fmtDate(r.date)+'</span></div>'+
      '<div class="res-actions"><button class="icon-btn" data-view="'+r.id+'" aria-label="View"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg></button>'+
      '<button class="icon-btn" data-dl="'+r.id+'" aria-label="Download"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></button>'+
      '<button class="icon-btn bookmark-btn '+(state.bookmarks.includes(r.id)?"active":"")+'" data-bm="'+r.id+'" aria-label="Bookmark"><svg viewBox="0 0 24 24" width="18" height="18" fill="'+(state.bookmarks.includes(r.id)?"currentColor":"none")+'" stroke="currentColor" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></button></div>';
  }

  function renderResources(filterFn,container){
    const list=resources.filter(filterFn);
    container.innerHTML="";
    if(!list.length){
      const msg=el("div",{class:"empty-state"});
      msg.innerHTML='<div class="empty-ill"><svg viewBox="0 0 64 64" width="72" height="72" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="10" y="14" width="44" height="36" rx="4"/><path d="M10 22h44M18 32h20M18 40h14"/></svg></div><h3>No resources found</h3><p>Nothing here yet. Check back later.</p>';
      container.appendChild(msg);
      return;
    }
    list.forEach(r=>{
      const card=el("div",{class:"res-card"});
      card.innerHTML=resourceRowHtml(r);
      card.addEventListener("click",e=>{
        const v=e.target.closest("[data-view]"),d=e.target.closest("[data-dl]"),b=e.target.closest("[data-bm]");
        if(v)openResourcePreview(r);
        else if(d)downloadDemo(r);
        else if(b)toggleBookmark(r.id,b);
      });
      container.appendChild(card);
    });
  }

  function renderAllResources(){
    const container=$("#resourceContainer");
    container.className="resource-container"+(state.resourceLayout==="list"?" list-view":"");
    const f=getResourceFilters();
    const list=resources.filter(r=>{
      if(f.branch&&r.branch!==f.branch)return false;
      if(f.year&&r.year!==f.year)return false;
      if(f.sem&&r.sem!==f.sem)return false;
      if(f.subject&&r.subject!==f.subject)return false;
      if(f.category&&r.category!==f.category)return false;
      if(f.search){const s=f.search.toLowerCase();if(!r.title.toLowerCase().includes(s)&&!subjectName(r.subject).toLowerCase().includes(s))return false;}
      return true;
    });
    container.innerHTML="";
    if(!list.length){
      $("#resEmpty").hidden=false;$("#resCount").textContent="0 resources";
      return;
    }
    $("#resEmpty").hidden=true;
    $("#resCount").textContent=list.length+" resource"+(list.length>1?"s":"");
    list.forEach(r=>{
      const card=el("div",{class:"res-card"});
      card.innerHTML=resourceRowHtml(r);
      card.addEventListener("click",e=>{
        const v=e.target.closest("[data-view]"),d=e.target.closest("[data-dl]"),b=e.target.closest("[data-bm]");
        if(v)openResourcePreview(r);
        else if(d)downloadDemo(r);
        else if(b)toggleBookmark(r.id,b);
      });
      container.appendChild(card);
    });
  }

  function getResourceFilters(){
    return {branch:$("#fBranch").value,year:$("#fYear").value,sem:$("#fSem").value,subject:$("#fSubject").value,category:$("#fCategory").value,search:$("#fSearch").value.trim()};
  }

  function populateFilters(){
    const fBranch=$("#fBranch");branches.forEach(b=>{const o=el("option",{value:b});o.textContent=b;fBranch.appendChild(o);});
    const fYear=$("#fYear");["1","2","3","4"].forEach(y=>{const o=el("option",{value:y});o.textContent="Year "+y;fYear.appendChild(o);});
    const fSem=$("#fSem");[{v:"sem1",t:"Semester 1"},{v:"sem2",t:"Semester 2"}].forEach(s=>{const o=el("option",{value:s.v});o.textContent=s.t;fSem.appendChild(o);});
    const fSub=$("#fSubject");subjects.forEach(s=>{const o=el("option",{value:s.id});o.textContent=s.name;fSub.appendChild(o);});
    const fCat=$("#fCategory");categories.forEach(c=>{const o=el("option",{value:c});o.textContent=c;fCat.appendChild(o);});
  }

  ["#fBranch","#fYear","#fSem","#fSubject","#fCategory","#fSearch"].forEach(s=>$(s).addEventListener("input",renderAllResources));
  $("#clearFilters").addEventListener("click",()=>{["#fBranch","#fYear","#fSem","#fSubject","#fCategory"].forEach(s=>$(s).value="");$("#fSearch").value="";renderAllResources();});
  $("#resEmptyClear").addEventListener("click",()=>$("#clearFilters").click());
  $$(".vt-btn").forEach(b=>b.addEventListener("click",()=>{
    $$(".vt-btn").forEach(x=>{x.classList.remove("active");x.setAttribute("aria-pressed","false");});
    b.classList.add("active");b.setAttribute("aria-pressed","true");
    state.resourceLayout=b.dataset.layout;Store.set("defaultView",state.resourceLayout);
    renderAllResources();
  }));

  function openResourcePreview(r){
    modal("Resource Preview",
      '<div style="display:flex;flex-direction:column;gap:14px">'+
      '<div style="display:flex;align-items:center;gap:12px"><span class="res-icon fmt-'+r.format+'" style="width:48px;height:48px">'+esc(r.format)+'</span><div><p style="font-size:16px;font-weight:600">'+esc(r.title)+'</p><p class="muted">'+esc(subjectName(r.subject))+'</p></div></div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:8px"><span class="res-meta" style="display:inline-block;font-size:12px;color:var(--ink-500);background:var(--gray-100);padding:4px 10px;border-radius:6px">'+esc(r.category)+'</span><span class="res-meta" style="display:inline-block;font-size:12px;color:var(--ink-500);background:var(--gray-100);padding:4px 10px;border-radius:6px">Semester '+r.sem.replace("sem","")+'</span><span class="res-meta" style="display:inline-block;font-size:12px;color:var(--ink-500);background:var(--gray-100);padding:4px 10px;border-radius:6px">'+esc(r.format)+'</span></div>'+
      '<p class="muted" style="font-size:13px">Uploaded by '+esc(r.uploader)+' on '+fmtDate(r.date)+'</p>'+
      '<div style="border:1px dashed var(--gray-300);border-radius:12px;padding:24px;text-align:center;color:var(--ink-500);font-size:13px"><strong>Demonstration preview.</strong><br>No actual file is attached in this frontend demo.</div></div>',
      '<button class="btn ghost" data-close>Close</button><button class="btn primary" data-dl-modal>Download (demo)</button>');
    $("[data-close]",$("#modalFoot")).addEventListener("click",closeModal);
    $("[data-dl-modal]",$("#modalFoot")).addEventListener("click",()=>{closeModal();downloadDemo(r);});
  }

  function downloadDemo(r){toast("Download started (demo)","info",r.title);}

  function toggleBookmark(id,btn){
    const i=state.bookmarks.indexOf(id);
    if(i>-1){state.bookmarks.splice(i,1);toast("Removed bookmark","info");}
    else{state.bookmarks.push(id);toast("Saved bookmark","success");}
    Store.set("bookmarks",state.bookmarks);
    if(btn){btn.classList.toggle("active");const svg=btn.querySelector("svg");svg.setAttribute("fill",btn.classList.contains("active")?"currentColor":"none");}
  }

  /* ---- Papers & Labs views ---- */
  function renderPapers(){renderResources(r=>r.category==="Previous Papers",$("#papersContainer"));}
  function renderLabs(){renderResources(r=>r.category==="Laboratory Programs",$("#labsContainer"));}

  /* ---------------- Assignments ---------------- */
  function renderAssignments(){
    const list=$("#assignmentList");
    const filter=$("#asgFilter").value,search=$("#asgSearch").value.trim().toLowerCase();
    const items=assignments.filter(a=>{
      const st=state.asgStatuses[a.id]||a.status;
      if(filter&&st!==filter)return false;
      if(search&&!a.title.toLowerCase().includes(search)&&!subjectName(a.subject).toLowerCase().includes(search))return false;
      return true;
    });
    list.innerHTML="";
    if(!items.length){list.innerHTML='<div class="asg-empty"><p>No assignments match your filters.</p></div>';return;}
    items.forEach(a=>{
      const st=state.asgStatuses[a.id]||a.status;
      const overdue=st!=="Completed"&&new Date(a.due)<new Date();
      const card=el("div",{class:"asg-card"});
      card.innerHTML=
        '<div class="asg-top"><div><h4>'+esc(a.title)+'</h4><p class="muted">'+esc(subjectName(a.subject))+'</p></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><span class="row-tag '+(overdue?"tag-overdue":"tag-"+st.toLowerCase())+'">'+(overdue?"Overdue":st)+'</span><span class="muted" style="font-size:12px"><span class="priority-dot '+(a.priority==="high"?"pd-high":a.priority==="medium"?"pd-med":"pd-low")+'"></span>'+esc(a.priority)+' priority</span></div></div>'+
        '<p class="asg-desc">'+esc(a.desc)+'</p>'+
        '<div class="asg-meta"><span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> Assigned '+fmtDate(a.assigned)+'</span><span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Due '+fmtDate(a.due)+'</span></div>'+
        '<div class="asg-actions">'+
        (st==="Pending"?'<button class="btn ghost" data-asg-act="submit" data-id="'+a.id+'">Mark Submitted</button>':"")+
        (st!=="Completed"?'<button class="btn primary" data-asg-act="complete" data-id="'+a.id+'">Mark Completed</button>':"")+
        (st!=="Pending"?'<button class="btn ghost" data-asg-act="reset" data-id="'+a.id+'">Reset</button>':"")+
        '<button class="btn ghost" data-asg-act="view" data-id="'+a.id+'">View details</button></div>';
      list.appendChild(card);
    });
  }
  $("#assignmentList").addEventListener("click",e=>{
    const b=e.target.closest("[data-asg-act]");if(!b)return;
    const id=parseInt(b.dataset.id),act=b.dataset.asgAct,a=assignments.find(x=>x.id===id);
    if(act==="view"){
      const st=state.asgStatuses[id]||a.status;
      modal(a.title,'<div style="display:flex;flex-direction:column;gap:10px"><p class="muted">'+esc(subjectName(a.subject))+'</p><p>'+esc(a.desc)+'</p><div style="display:flex;gap:10px;font-size:13px;color:var(--ink-500)"><span>Assigned: '+fmtDate(a.assigned)+'</span><span>Due: '+fmtDate(a.due)+'</span></div><p>Status: <strong>'+st+'</strong></p><p class="demo-note">This is a demonstration. No submission is sent to faculty.</p></div>','<button class="btn ghost" data-close>Close</button>');
      $("[data-close]",$("#modalFoot")).addEventListener("click",closeModal);
    }else if(act==="submit"){state.asgStatuses[id]="Submitted";Store.set("asgStatuses",state.asgStatuses);renderAssignments();toast("Assignment marked submitted","success");}
    else if(act==="complete"){state.asgStatuses[id]="Completed";Store.set("asgStatuses",state.asgStatuses);renderAssignments();toast("Assignment marked completed","success");}
    else if(act==="reset"){delete state.asgStatuses[id];Store.set("asgStatuses",state.asgStatuses);renderAssignments();toast("Assignment reset","info");}
  });
  ["#asgFilter","#asgSearch"].forEach(s=>$(s).addEventListener("input",renderAssignments));

  /* ---------------- AI Assistant ---------------- */
  function renderChat(){
    const area=$("#chatArea");
    area.innerHTML="";
    if(!state.chat.length){
      const welcome=el("div",{class:"msg assistant"});
      welcome.innerHTML='<span class="msg-avatar">AI</span><div class="msg-bubble">Hi! I\'m your EduVault study assistant. Ask me about your syllabus, request practice questions, or ask me to explain a lab program. <strong>This is a demonstration</strong> — answers are not verified syllabus content.</div>';
      area.appendChild(welcome);
      return;
    }
    state.chat.forEach(m=>appendMessage(m.role,m.text,m.source));
  }
  function appendMessage(role,text,source){
    const area=$("#chatArea");
    const msg=el("div",{class:"msg "+role});
    msg.innerHTML='<span class="msg-avatar">'+(role==="user"?"You":"AI")+'</span><div class="msg-bubble">'+esc(text).replace(/\n/g,"<br>")+'</div>';
    area.appendChild(msg);
    if(source){const s=el("div",{class:"msg-source"});s.textContent="Source: "+source;area.appendChild(s);}
    area.scrollTop=area.scrollHeight;
  }
  function showTyping(){
    const area=$("#chatArea");
    const t=el("div",{class:"typing"});t.innerHTML="<span></span><span></span><span></span>";t.id="typingIndicator";
    area.appendChild(t);area.scrollTop=area.scrollHeight;
  }
  function hideTyping(){const t=$("#typingIndicator");if(t)t.remove();}
  function aiReply(question){
    for(const r of aiResponses){if(r.match.test(question))return {text:r.reply,source:r.source};}
    return {text:aiFallback,source:"Demonstration only"};
  }
  $("#chatForm").addEventListener("submit",e=>{
    e.preventDefault();
    const input=$("#chatInput");
    const q=input.value.trim();if(!q)return;
    input.value="";
    state.chat.push({role:"user",text:q});
    appendMessage("user",q);
    showTyping();
    setTimeout(()=>{
      hideTyping();
      const reply=aiReply(q);
      state.chat.push({role:"assistant",text:reply.text,source:reply.source});
      appendMessage("assistant",reply.text,reply.source);
      Store.set("chat",state.chat);
    },900);
  });
  $("#assistantSuggest").addEventListener("click",e=>{const b=e.target.closest(".suggest-chip");if(!b)return;$("#chatInput").value=b.dataset.q;$("#chatInput").focus();});
  $("#clearChat").addEventListener("click",()=>{confirmModal("Clear chat","Remove all messages from this conversation?",()=>{state.chat=[];Store.set("chat",[]);renderChat();toast("Chat cleared","info");},"Clear",true);});

  /* ---------------- Practice Tests ---------------- */
  function renderTests(){
    if(state.quiz.active)return;
    const list=$("#testList");list.innerHTML="";
    tests.forEach(t=>{
      const card=el("div",{class:"test-card"});
      card.innerHTML='<div><h4>'+esc(t.title)+'</h4><p class="muted">'+esc(t.subject)+'</p></div><div class="test-meta"><span>'+t.qcount+' questions</span><span>'+Math.floor(t.duration/60)+' min</span><span class="diff-'+t.difficulty+'">'+esc(t.difficulty.charAt(0).toUpperCase()+t.difficulty.slice(1))+'</span></div><button class="btn primary" data-start="'+t.id+'">Start test</button>';
      list.appendChild(card);
    });
  }
  $("#testList").addEventListener("click",e=>{
    const b=e.target.closest("[data-start]");if(!b)return;
    startTest(parseInt(b.dataset.start));
  });

  function startTest(id){
    const t=tests.find(x=>x.id===id);if(!t)return;
    state.quiz={active:true,test:t,answers:new Array(t.questions.length).fill(null),current:0,timer:null,remaining:t.duration,submitted:false};
    $("#testList").hidden=true;$("#quizResult").hidden=true;$("#quizPanel").hidden=false;
    $("#quizTitle").textContent=t.title;$("#quizSub").textContent=t.subject+" · "+t.qcount+" questions";
    state.quiz.timer=setInterval(tick,1000);
    renderQuestion();
  }
  function tick(){
    state.quiz.remaining--;
    updateTimer();
    if(state.quiz.remaining<=0){clearInterval(state.quiz.timer);submitTest(true);}
  }
  function updateTimer(){
    const m=Math.floor(Math.max(0,state.quiz.remaining)/60),s=Math.max(0,state.quiz.remaining)%60;
    $("#quizTimer").textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
    $("#quizTimer").classList.toggle("warn",state.quiz.remaining<=30);
  }
  function renderQuestion(){
    const q=state.quiz.test.questions[state.quiz.current];
    $("#quizProgressBar").style.width=((state.quiz.current+1)/state.quiz.test.questions.length*100)+"%";
    $("#quizCounter").textContent="Question "+(state.quiz.current+1)+" of "+state.quiz.test.questions.length;
    updateTimer();
    const body=$("#quizBody");
    body.innerHTML='<p class="quiz-q">'+esc(state.quiz.current+1+". "+q.q)+'</p>';
    q.opts.forEach((opt,i)=>{
      const b=el("button",{class:"quiz-opt"+(state.quiz.answers[state.quiz.current]===i?" selected":""),"data-opt":i});
      b.textContent=opt;
      b.addEventListener("click",()=>{state.quiz.answers[state.quiz.current]=i;renderQuestion();});
      body.appendChild(b);
    });
    $("#quizPrev").disabled=state.quiz.current===0;
    $("#quizNext").disabled=state.quiz.current===state.quiz.test.questions.length-1;
  }
  $("#quizPrev").addEventListener("click",()=>{if(state.quiz.current>0){state.quiz.current--;renderQuestion();}});
  $("#quizNext").addEventListener("click",()=>{if(state.quiz.current<state.quiz.test.questions.length-1){state.quiz.current++;renderQuestion();}});
  $("#quizSubmit").addEventListener("click",()=>{
    const unanswered=state.quiz.answers.filter(a=>a===null).length;
    if(unanswered>0){confirmModal("Submit test?","You have "+unanswered+" unanswered question"+(unanswered>1?"s":"")+". Submit anyway?",()=>submitTest(false),"Submit",true);}
    else{confirmModal("Submit test?","Submit your test and see results?",()=>submitTest(false),"Submit");}
  });
  $("#quizCancel").addEventListener("click",()=>{confirmModal("Exit test?","Your progress will be lost. Exit the test?",()=>{clearInterval(state.quiz.timer);endTest();},"Exit",true);});

  function submitTest(timedOut){
    if(state.quiz.submitted)return;
    state.quiz.submitted=true;
    clearInterval(state.quiz.timer);
    const t=state.quiz.test;
    let correct=0;const topicStats={};
    t.questions.forEach((q,i)=>{
      const ans=state.quiz.answers[i];
      const ok=ans===q.ans;
      if(ok)correct++;
      if(!topicStats[q.topic])topicStats[q.topic]={correct:0,total:0};
      topicStats[q.topic].total++;
      if(ok)topicStats[q.topic].correct++;
    });
    const pct=Math.round(correct/t.questions.length*100);
    showResult(t,correct,t.questions.length-correct,pct,topicStats,timedOut);
    updateProgress(t,pct);
  }
  function showResult(t,correct,incorrect,pct,topics,timedOut){
    $("#quizPanel").hidden=true;
    const grade=pct>=85?"Excellent":pct>=70?"Good":pct>=50?"Fair":"Needs improvement";
    const r=$("#quizResult");
    r.hidden=false;
    let topicHtml=Object.keys(topics).map(tp=>{
      const s=Math.round(topics[tp].correct/topics[tp].total*100);
      const col=s>=70?"var(--success)":s>=50?"var(--warning)":"var(--error)";
      return '<div class="topic-row"><span>'+esc(tp)+'</span><div class="topic-bar"><span style="width:'+s+'%;background:'+col+'"></span></div><span class="topic-pct">'+s+'%</span></div>';
    }).join("");
    const weak=Object.keys(topics).filter(tp=>topics[tp].correct/topics[tp].total<0.7);
    const recs=weak.length?weak.map(w=>"<li>Review <strong>"+esc(w)+"</strong> — score below 70%.</li>").join(""):"<li>No weak topics — great work!</li>";
    r.innerHTML=
      '<div class="result-hero"><p class="muted">'+esc(t.title)+(timedOut?" · Time expired":"")+'</p><div class="result-score">'+pct+'%</div><div class="result-grade">'+grade+'</div></div>'+
      '<div class="result-stats"><div class="result-stat"><h4 style="color:var(--success)">'+correct+'</h4><p>Correct</p></div><div class="result-stat"><h4 style="color:var(--error)">'+incorrect+'</h4><p>Incorrect</p></div><div class="result-stat"><h4>'+t.questions.length+'</h4><p>Total</p></div></div>'+
      '<div class="card" style="margin:0;box-shadow:none;border:1px solid var(--gray-200)"><div class="card-head"><h3>Topic-wise performance</h3></div><div class="card-body">'+topicHtml+'</div></div>'+
      '<div class="card" style="margin-top:16px;box-shadow:none;border:1px solid var(--gray-200)"><div class="card-head"><h3>Suggested areas to revise</h3></div><div class="card-body"><ul style="padding-left:18px;font-size:13.5px;line-height:1.8">'+recs+'</ul></div></div>'+
      '<div style="text-align:center;margin-top:20px"><button class="btn primary" id="retakeBtn">Retake test</button> <button class="btn ghost" id="backTestsBtn">Back to tests</button></div>';
    $("#retakeBtn").addEventListener("click",()=>{endTest();startTest(t.id);});
    $("#backTestsBtn").addEventListener("click",endTest);
    toast("Test submitted — score: "+pct+"%","success");
  }
  function endTest(){
    state.quiz={active:false,test:null,answers:[],current:0,timer:null,remaining:0,submitted:false};
    $("#quizPanel").hidden=true;$("#quizResult").hidden=true;$("#testList").hidden=false;
    renderTests();
  }
  function updateProgress(test,score){
    progressData.testHistory.unshift({name:test.title,score:score,date:new Date().toISOString().slice(0,10)});
    progressData.testHistory=progressData.testHistory.slice(0,8);
  }

  /* ---------------- Progress ---------------- */
  function renderProgress(){
    const avg=Math.round(progressData.testHistory.reduce((s,t)=>s+t.score,0)/progressData.testHistory.length);
    $("#progressStats").innerHTML=
      statCardHtml("Tests completed",progressData.testHistory.length,"var(--indigo-600)","rgba(91,109,224,.12)","tst")+
      statCardHtml("Average score",avg+"%","var(--success)","var(--success-bg)","scr")+
      statCardHtml("Best score",Math.max(...progressData.testHistory.map(t=>t.score))+"%","var(--violet-500)","rgba(123,108,255,.12)","res")+
      statCardHtml("Recent trend",progressData.testHistory[0].score>=progressData.testHistory[1].score?"↑ Improving":"↓ Declining","var(--warning)","var(--warning-bg)","asg");

    const sp=$("#subjectPerf");sp.innerHTML="";
    progressData.subjectPerf.forEach(s=>{
      const row=el("div",{class:"perf-row"});
      const col=s.score>=80?"var(--success)":s.score>=60?"var(--warning)":"var(--error)";
      row.innerHTML='<div class="perf-top"><span>'+esc(s.name)+'</span><span>'+s.score+'%</span></div><div class="perf-bar"><span style="width:'+s.score+'%;background:'+col+'"></span></div>';
      sp.appendChild(row);
    });

    const tp=$("#topicPerf");tp.innerHTML="";
    progressData.topicPerf.forEach(t=>{
      const item=el("div",{class:"topic-card"});
      const col=t.score>=80?"var(--success)":t.score>=50?"var(--warning)":"var(--error)";
      item.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><h4>'+esc(t.topic)+'</h4><span class="row-tag '+(t.status==="strength"?"tag-completed":"tag-overdue")+'">'+(t.status==="strength"?"Strength":"Improve")+'</span></div><div class="perf-bar" style="margin-top:8px"><span style="width:'+t.score+'%;background:'+col+'"></span></div><p class="muted" style="margin-top:6px">'+t.score+'% in recent tests</p>';
      tp.appendChild(item);
    });

    renderScoreChart();
    renderProgressRecs();
  }
  function statCardHtml(label,value,icColor,icBg,cls){
    return '<div class="stat-card"><div class="stat-icon '+cls+'" style="background:'+icBg+';color:'+icColor+'"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/></svg></div><div><p class="stat-label">'+label+'</p><p class="stat-value">'+value+'</p></div></div>';
  }
  function renderScoreChart(){
    const svg=$("#scoreChart");
    const pts=progressData.testHistory.slice(0,5).reverse();
    const w=320,h=160,pad=24;
    const max=100;
    let path="";
    pts.forEach((p,i)=>{
      const x=pad+(i/(pts.length-1))*(w-pad*2);
      const y=h-pad-(p.score/max)*(h-pad*2);
      path+=(i===0?"M":"L")+x+","+y+" ";
    });
    svg.innerHTML=
      '<line x1="24" y1="136" x2="296" y2="136" stroke="var(--gray-200)"/>'+
      '<line x1="24" y1="24" x2="24" y2="136" stroke="var(--gray-200)"/>'+
      '<path d="'+path+'" fill="none" stroke="var(--indigo-600)" stroke-width="2.5"/>'+
      pts.map((p,i)=>{
        const x=pad+(i/(pts.length-1))*(w-pad*2),y=h-pad-(p.score/max)*(h-pad*2);
        return '<circle cx="'+x+'" cy="'+y+'" r="3.5" fill="#fff" stroke="var(--indigo-600)" stroke-width="2"/>';
      }).join("");
  }
  function renderProgressRecs(){
    const rec=$("#progressRecs");rec.innerHTML="";
    const weak=progressData.topicPerf.filter(t=>t.status==="improve").map(t=>t.topic);
    const recs=resources.filter(r=>{
      const sub=subjectName(r.subject);
      return weak.some(w=>sub.toLowerCase().includes("c")||sub.toLowerCase().includes("math")||sub.toLowerCase().includes("data"));
    }).slice(0,4);
    if(!recs.length){rec.innerHTML='<p class="asg-empty">No recommendations yet.</p>';return;}
    recs.forEach(r=>{const item=el("div",{class:"row-item",role:"button",tabindex:"0"});item.innerHTML=resourceRowHtml(r);item.addEventListener("click",()=>openResourcePreview(r));rec.appendChild(item);});
  }

  /* ---------------- Announcements ---------------- */
  let annFilter="all";
  function renderAnnouncements(){
    const list=$("#annList");
    const items=announcements.filter(a=>{
      if(annFilter==="unread")return !state.annRead.includes(a.id);
      if(annFilter==="important")return a.priority==="Important";
      return true;
    });
    list.innerHTML="";
    if(!items.length){list.innerHTML='<div class="asg-empty"><p>No announcements match this filter.</p></div>';return;}
    items.forEach(a=>{
      const isRead=state.annRead.includes(a.id);
      const card=el("div",{class:"ann-card"+(isRead?"":" unread"),"data-ann":a.id});
      card.innerHTML='<div class="asg-top"><h4>'+esc(a.title)+'</h4><span class="row-tag '+(a.priority==="Important"?"tag-important":"tag-normal")+'">'+esc(a.priority)+'</span></div><p class="muted">'+esc(a.desc)+'</p><div class="ann-foot"><span class="row-tag '+(isRead?"tag-normal":"tag-unread")+'">'+(isRead?"Read":"Unread")+'</span><span class="muted" style="font-size:12px">'+esc(a.dept)+'</span><time>'+fmtDate(a.date)+'</time></div>';
      card.addEventListener("click",()=>markAnnouncementRead(a.id));
      list.appendChild(card);
    });
  }
  function markAnnouncementRead(id){
    if(!state.annRead.includes(id)){state.annRead.push(id);Store.set("annRead",state.annRead);renderAnnouncements();updateNotifDot();}
  }
  $$(".tab").forEach(t=>t.addEventListener("click",()=>{
    $$(".tab").forEach(x=>{x.classList.remove("active");x.setAttribute("aria-selected","false");});
    t.classList.add("active");t.setAttribute("aria-selected","true");
    annFilter=t.dataset.annFilter;renderAnnouncements();
  }));

  /* ---------------- Notifications ---------------- */
  function renderNotifications(){
    const list=$("#notifList");list.innerHTML="";
    if(state.notifRead){$("#notifEmpty").hidden=false;list.hidden=true;return;}
    $("#notifEmpty").hidden=true;list.hidden=false;
    notifications.forEach(n=>{
      const li=el("li",{"data-notif":n.id});
      li.innerHTML='<div class="notif-ic '+n.icon+'"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg></div><div class="notif-body"><p>'+esc(n.text)+'</p><time>'+esc(n.time)+'</time></div>';
      if(n.annId)li.addEventListener("click",()=>{closeNotifPanel();markAnnouncementRead(n.annId);navigate("announcements");});
      list.appendChild(li);
    });
  }
  function updateNotifDot(){
    const unread=announcements.filter(a=>!state.annRead.includes(a.id)).length;
    $("#notifDot").hidden=unread===0;
  }
  function openNotifPanel(){$("#notifPanel").hidden=false;$("#notifBtn").setAttribute("aria-expanded","true");renderNotifications();}
  function closeNotifPanel(){$("#notifPanel").hidden=true;$("#notifBtn").setAttribute("aria-expanded","false");}
  $("#notifBtn").addEventListener("click",e=>{e.stopPropagation();$("#notifPanel").hidden?openNotifPanel():closeNotifPanel();});
  $("#markAllRead").addEventListener("click",()=>{
    announcements.forEach(a=>{if(!state.annRead.includes(a.id))state.annRead.push(a.id);});
    Store.set("annRead",state.annRead);
    state.notifRead=true;Store.set("notifRead",true);
    renderNotifications();updateNotifDot();toast("All notifications marked read","success");
  });
  document.addEventListener("click",e=>{
    if(!$("#notifPanel").hidden&&!$("#notifPanel").contains(e.target)&&e.target!==$("#notifBtn")&&!$("#notifBtn").contains(e.target))closeNotifPanel();
    const pd=$("#profileDropdown");
    if(!pd.hidden&&!pd.contains(e.target)&&e.target!==$("#profileBtn")&&!$("#profileBtn").contains(e.target)){pd.hidden=true;$("#profileBtn").setAttribute("aria-expanded","false");}
  });
  $("#profileBtn").addEventListener("click",e=>{e.stopPropagation();const d=$("#profileDropdown");d.hidden=!d.hidden;$("#profileBtn").setAttribute("aria-expanded",!d.hidden);});
  $("#signOutBtn").addEventListener("click",()=>{$("#profileDropdown").hidden=true;toast("Signed out (demo)","info");navigate("overview");});

  /* ---------------- Faculty Console ---------------- */
  let facultyResources=[];
  function renderFacultyResources(){
    facultyResources=resources.map(r=>({...r}));
    $("#fResCount").textContent=facultyResources.length;
    const body=$("#facultyResBody");body.innerHTML="";
    facultyResources.forEach((r,i)=>{
      const tr=el("tr");
      tr.innerHTML='<td>'+esc(r.title)+'</td><td>'+esc(subjectName(r.subject))+'</td><td>'+esc(r.category)+'</td><td>'+esc(r.format)+'</td><td>'+fmtDate(r.date)+'</td><td><div class="table-actions"><button class="icon-btn" data-edit="'+i+'" aria-label="Edit"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z"/></svg></button><button class="icon-btn" data-del="'+i+'" aria-label="Delete"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button></div></td>';
      body.appendChild(tr);
    });
  }
  $("#facultyResBody").addEventListener("click",e=>{
    const del=e.target.closest("[data-del]"),edit=e.target.closest("[data-edit]");
    if(del){const i=parseInt(del.dataset.del);confirmModal("Delete resource","Delete \""+facultyResources[i].title+"\"? This cannot be undone.",()=>{facultyResources.splice(i,1);renderFacultyResources();toast("Resource deleted","success");},"Delete",true);}
    if(edit){const i=parseInt(edit.dataset.edit);const r=facultyResources[i];toast("Edit (demo)","info",r.title);}
  });
  $("#reloadFacultyRes").addEventListener("click",()=>{renderFacultyResources();toast("Resource list refreshed","info");});
  (function(){const sel=$("#addResSubject");subjects.forEach(s=>{const o=el("option",{value:s.id});o.textContent=s.name;sel.appendChild(o);});})();
  $("#addResForm").addEventListener("submit",e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const title=fd.get("title").trim();
    if(!title){toast("Title is required","error");return;}
    const nr={id:uid(),title:title,subject:fd.get("subject"),sem:"sem1",category:fd.get("category"),format:fd.get("format"),date:new Date().toISOString().slice(0,10),uploader:"Prof. R. Mehta",branch:"Computer Science",year:"1"};
    resources.unshift(nr);facultyResources.unshift({...nr});
    renderFacultyResources();renderAllResources();
    e.target.reset();toast("Resource added","success");
  });
  $("#addAnnForm").addEventListener("submit",e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const title=fd.get("title").trim();
    if(!title){toast("Title is required","error");return;}
    const na={id:uid(),title:title,dept:"Computer Science Dept.",date:new Date().toISOString().slice(0,10),priority:fd.get("priority"),desc:fd.get("desc").trim(),read:false};
    announcements.unshift(na);renderAnnouncements();
    e.target.reset();toast("Announcement posted","success");
  });

  /* ---------------- Help ---------------- */
  const faqs=[
    {q:"How do I find study resources?",a:"Go to Study Resources in the sidebar and use the filters for branch, year, semester, subject and category. You can also use the global search in the top bar."},
    {q:"Can I download resources?",a:"Yes. Each resource card has view, download and bookmark actions. In this demo, downloads are simulated and no actual file is transferred."},
    {q:"How does the AI Study Assistant work?",a:"The assistant provides demonstration answers using predefined responses. It is designed so a real AI API can be connected later without exposing API keys in the frontend."},
    {q:"Are my preferences saved?",a:"Yes. Bookmarks, assignment statuses, announcement read states and settings are saved in your browser's local storage. Clearing your browser data will reset them."}
  ];
  (function(){
    const list=$("#faqList");
    faqs.forEach(f=>{
      const item=el("div",{class:"faq-item"});
      item.innerHTML='<button class="faq-q" aria-expanded="false">'+esc(f.q)+'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button><div class="faq-a"><p>'+esc(f.a)+'</p></div>';
      item.querySelector(".faq-q").addEventListener("click",()=>{
        const open=item.classList.toggle("open");
        item.querySelector(".faq-q").setAttribute("aria-expanded",open);
      });
      list.appendChild(item);
    });
  })();
  $("#helpForm").addEventListener("submit",e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    if(!fd.get("subject").trim()||!fd.get("message").trim()){toast("Please fill in all fields","error");return;}
    e.target.reset();toast("Message sent (demo)","success","Our team will respond shortly.");
  });

  /* ---------------- Settings ---------------- */
  function applyPrefs(){
    document.body.classList.toggle("compact",state.preferences.compact);
    document.body.classList.toggle("reduced-motion",state.preferences.reducedMotion);
    $("#setCompact").checked=state.preferences.compact;
    $("#setReducedMotion").checked=state.preferences.reducedMotion;
    $("#setDefaultView").value=state.preferences.defaultView;
  }
  $("#setCompact").addEventListener("change",e=>{state.preferences.compact=e.target.checked;Store.set("prefs",state.preferences);document.body.classList.toggle("compact",e.target.checked);});
  $("#setReducedMotion").addEventListener("change",e=>{state.preferences.reducedMotion=e.target.checked;Store.set("prefs",state.preferences);document.body.classList.toggle("reduced-motion",e.target.checked);});
  $("#setDefaultView").addEventListener("change",e=>{
    state.preferences.defaultView=e.target.value;
    state.resourceLayout=e.target.value;
    Store.set("prefs",state.preferences);
    Store.set("defaultView",state.resourceLayout);
    $$(".vt-btn").forEach(b=>{
      const active=b.dataset.layout===state.resourceLayout;
      b.classList.toggle("active",active);
      b.setAttribute("aria-pressed",active);
    });
    renderAllResources();
  });
  $("#clearData").addEventListener("click",()=>{confirmModal("Clear local data","This will remove bookmarks, assignment statuses and preferences. Continue?",()=>{Store.clearAll();location.reload();},"Clear data",true);});

  /* ---------------- Global search ---------------- */
  $("#globalSearch").addEventListener("input",e=>{
    const q=e.target.value.trim().toLowerCase();
    if(q&&state.currentView!=="resources"){navigate("resources");}
    $("#fSearch").value=q;renderAllResources();
  });
  document.addEventListener("keydown",e=>{
    if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();$("#globalSearch").focus();}
  });

  /* ---------------- Init ---------------- */
  function init(){
    populateFilters();
    state.resourceLayout=state.preferences.defaultView||"grid";
    applyPrefs();
    $$(".vt-btn").forEach(b=>{b.classList.toggle("active",b.dataset.layout===state.resourceLayout);b.setAttribute("aria-pressed",b.dataset.layout===state.resourceLayout);});
    renderOverview();
    renderAllResources();
    renderPapers();
    renderLabs();
    renderAssignments();
    renderTests();
    renderAnnouncements();
    updateNotifDot();
  }
  init();

})();
