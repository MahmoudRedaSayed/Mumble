const APP_ID="c419b3be715d41dea6671362482e3db9";
const token=null;
let uid=sessionStorage.getItem("uid");
let roomId;
const querySearch=window.location.search;
const Params=new URLSearchParams(querySearch);
roomId=Params.get("room")
let dispalyName;
if(!uid)
{
    uid=Math.floor(Math.random()*10000);
    sessionStorage.setItem("uid",uid);
}
if(!roomId)
{
    roomId="main"
}
if(sessionStorage.getItem("display_name")===null)
{
    window.location=`lobby.html`;
}
else
{
    dispalyName=sessionStorage.getItem("display_name");
    console.log(dispalyName);
}

let rtmClient;
let channel;
let client;
let localTracks=[];
let screenTracks=[];
let remoteUsers={};
let sharingScreen=false;

//////////expend the screen//////////
let boxFrame=document.getElementById("stream__box");
let videos=document.getElementsByClassName("video__container");
let userIdInDisplayFrame=null;
let expend=(e)=>{
  console.log("change")
  let child=boxFrame.children[1];
  if(child)
  {
    document.getElementById("streams__container").appendChild(child);
  }
  boxFrame.appendChild(e.currentTarget);
  userIdInDisplayFrame=e.currentTarget.id;
  boxFrame.style.display="block";
}

for(let i=0;i<videos.length;i++)
{
  videos[i].addEventListener("click",expend);
}


///////////////////////////////////////////////
async function joinRemoteRoom(){
    rtmClient=await AgoraRTM.createInstance(APP_ID);
    await rtmClient.login({uid,token});
    await rtmClient.addOrUpdateLocalUserAttributes({"name":dispalyName});
    channel=await rtmClient.createChannel(roomId);
    await channel.join()
    // to add the first member in the channel 
    getMembers();
    channel.on("MemberJoined",handleMemberJoined);
    channel.on('MemberLeft',handleMemberLeft)
    client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
    await client.join(APP_ID, roomId, token, uid)

    client.on('user-published', handleUserPublished)
    client.on('user-left', handleUserLeft)
    joinRoom();
}
let handleUserPublished=async(user,mediaType)=>{
    remoteUsers[user.uid]=user;
    await client.subscribe(user, mediaType)
    let player = document.getElementById(`user-container-${user.uid}`)
    console.log("publish",player);
    if(player===null)
    {
      console.log("from if",user.uid);
        player=`<div class="video__container"id="user-container-${user.uid}"  onclick="expend()"><div class="video-player" id="user_${user.uid}"></div>
    </div>`
        document.getElementById("streams__container").insertAdjacentHTML("afterBegin",player);
        document.getElementById(`user-container-${user.uid}`).addEventListener("click",expend);
    }
    if(mediaType=="video")
    {
        user.videoTrack.play(`user_${user.uid}`);
    }
    if(mediaType=="aduio")
    {
        user.aduioTrack.play();
    }
}
let handleUserLeft=(user)=>{
    delete remoteUsers[user.uid]
    let item = document.getElementById(`user-container-${user.uid}`)
    if(item){
        item.remove()
    }

    if(userIdInDisplayFrame === `user-container-${user.uid}`){
        displayFrame.style.display = null
        
        let videoFrames = document.getElementsByClassName('video__container')

        for(let i = 0; videoFrames.length > i; i++){
            videoFrames[i].style.height = '300px'
            videoFrames[i].style.width = '300px'
        }
    }
}
let  joinRoom= async()=>{
    localTracks=await AgoraRTC.createMicrophoneAndCameraTracks();
    let player=`<div class="video__container"id="user-container-${uid}"><div class="video-player" id="user_${uid}"></div>
    </div>`
    document.getElementById("streams__container").insertAdjacentHTML("afterBegin",player);
    document.getElementById(`user-container-${uid}`).addEventListener("click",expend);
    localTracks[1].play(`user_${uid}`);
    await client.publish([localTracks[0], localTracks[1]])

}
let toggleCamera=async(e)=>{
    let btn=e.currentTarget
    if(localTracks[1].muted)
    {
      await localTracks[1].setMuted(false);
      btn.classList.add("active");
    }
    else{
      await localTracks[1].setMuted(true);
      btn.classList.remove("active");
    }
  
  }
  let toggleMic=async(e)=>{
    let btn=e.currentTarget
    if(localTracks[0].muted)
    {
      await localTracks[0].setMuted(false);
      btn.classList.add("active");
    }
    else{
      await localTracks[0].setMuted(true);
      btn.classList.remove("active");
    }
  
  }
let toggleScreen=async(e)=>{
    let obj=e.currentTarget;
    let cam=document.getElementById("camera-btn");
    if(!sharingScreen)
    {
    sharingScreen=true;
    obj.classList.add("active");
    cam.classList.remove("active");
    cam.style.display="none"
    screenTracks=await AgoraRTC.createScreenVideoTrack();
    document.getElementById(`user-container-${uid}`).remove();
    let player=`<div class="video__container"id="user-container-${uid}" ><div class="video-player" id="user_${uid}"></div>
    </div>`
    document.getElementById("streams__container").insertAdjacentHTML("beforeend",player);
    document.getElementById(`user-container-${uid}`).addEventListener("click",expend);
    screenTracks.play(`user_${uid}`);
    await client.unpublish([localTracks[1]])
    await client.publish([screenTracks]);
    }
    else{
    console.log("must block");

    sharingScreen=false;
    obj.classList.remove("active");
    cam.style.display='block';
    document.getElementById(`user-container-${uid}`).remove();
    await client.unpublish([screenTracks]);
    switchToCamera()

    }
}
  let switchToCamera= async ()=>{
    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                </div>`
    document.getElementById("streams__container").insertAdjacentHTML('afterBegin', player)
    document.getElementById(`user-container-${uid}`).addEventListener("click",expend);
      await localTracks[0].setMuted(true)
      await localTracks[1].setMuted(true)
  
      document.getElementById('mic-btn').classList.remove('active')
      document.getElementById('screen-btn').classList.remove('active')
  
      localTracks[1].play(`user-${uid}`)
      await client.publish([localTracks[1]]);
  }
  let closeBoxStream=()=>{
    let child=boxFrame.children[1];
    if(child)
    {
      document.getElementById("streams__container").appendChild(child);
    }
    boxFrame.style.display="none";
  }
  document.getElementById("close-icon").addEventListener("click",closeBoxStream);
  document.getElementById("camera-btn").addEventListener("click",toggleCamera);
  document.getElementById("mic-btn").addEventListener("click",toggleMic);
  document.getElementById("screen-btn").addEventListener("click",toggleScreen);
joinRemoteRoom();