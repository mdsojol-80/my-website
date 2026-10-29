
"use strict";
const $=id=>document.getElementById(id);
let events=4,started=Date.now(),timer=null;

function addEvent(title,detail="INFO"){
  const item=document.createElement("div");
  item.className="event";
  item.textContent=title;
  const small=document.createElement("small");
  small.textContent=detail+" · "+new Date().toLocaleTimeString();
  item.appendChild(small);
  $("feed").prepend(item);
  while($("feed").children.length>12)$("feed").lastElementChild.remove();
  events++;
  $("eventCount").textContent=String(events).padStart(2,"0");
}
function term(line){
  const box=$("terminal");
  box.textContent += "\n";
  const prefix=document.createElement("span");
  prefix.className="prompt";
  prefix.textContent="operator@vyronix-lab:~$ ";
  box.appendChild(prefix);
  box.appendChild(document.createTextNode(line));
  box.scrollTop=box.scrollHeight;
}
$("commandForm").addEventListener("submit",e=>{
  e.preventDefault();
  const cmd=$("command").value.trim().toLowerCase();
  $("command").value="";
  if(!cmd)return;
  term(cmd);
  const responses={
    help:"Commands: help, status, hosts, events, clear",
    status:"LAB ONLINE | SIMULATION MODE | EXTERNAL SCANNING DISABLED",
    hosts:"HOST-01 UP | HOST-02 UP | HOST-03 UP (fictional training hosts)",
    events:()=>[...$("feed").children].map(x=>x.textContent).join("\n")
  };
  if(cmd==="clear"){$("terminal").textContent="Terminal cleared. Type help for commands.";return}
  const result=responses[cmd];
  if(result!==undefined){
    const value=typeof result==="function"?result():result;
    term(value);
  }else term("Unknown command. Type help.");
  addEvent("Terminal command: "+cmd,"OPERATOR");
});
$("scanBtn").addEventListener("click",()=>{
  if(timer)return;
  $("scanBtn").disabled=true;
  $("scanStatus").textContent="Simulated scan in progress...";
  $("scanBar").style.width="0%";
  let progress=0;
  addEvent("Training scan started","SIMULATION");
  timer=setInterval(()=>{
    progress+=20;
    $("scanBar").style.width=progress+"%";
    $("scanStatus").textContent="Analyzing fictional lab hosts: "+progress+"%";
    if(progress>=100){
      clearInterval(timer);timer=null;
      $("scanBtn").disabled=false;
      $("scanStatus").textContent="Completed: 3 fictional hosts available; sample ports 80 and 443 shown. No real network traffic sent.";
      $("alertLevel").textContent="LOW";
      addEvent("Lab scan complete: 3 sample hosts","SIMULATION");
      term("SCAN COMPLETE: 3 training hosts UP; sample ports 80/443. No external traffic.");
    }
  },350);
});
$("resetBtn").addEventListener("click",()=>{
  if(timer){clearInterval(timer);timer=null}
  $("scanBtn").disabled=false;
  $("scanBar").style.width="0%";
  $("scanStatus").textContent="Ready. Scan uses fictional training hosts only.";
  $("alertLevel").textContent="LOW";
  addEvent("Lab view reset","OPERATOR");
});
setInterval(()=>{
  const s=Math.floor((Date.now()-started)/1000);
  $("clock").textContent=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
},1000);
