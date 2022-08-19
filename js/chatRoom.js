const APP_ID="c419b3be715d41dea6671362482e3db9";
const token=null;
let uid=localStorage.getItem("uid");
let roomId;
const querySearch=window.location.search;
const Params=new URLSearchParams(querySearch);
roomId=Params.get("room")
if(!uid)
{
    uid=Math.floor(Math.random()*10000);
    localStorage.setItem("uid",uid);
}
if(!roomId)
{
    roomId="main"
}

let client;
localTracks=[];
remoteUsers={};
function joinRemoteRoom(){
    client=AgoraRTC.createClient({"mode":"rtc","codec":"vp8"});
    client.on("user-published",handleUserPublish);
    client.on("user-left",handleUserleft);
    client.join(APP_ID,roomId,token,uid);
    joinRoom();
}
let handleUserPublish=async(user,mediaType)=>{
    remoteUsers[user.uid]=user;
    await client.subscribe(user,mediaType);
    let player=document.getElementById(`user-container-${user.uid}`);
    if(player===null)
    {
        player=`<div class="video__container"id="user-container-${uid}"  onclick="expend()"><div class="video-player" id="user_${uid}"></div>
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
        user.aduioTrack.play(`user_${user.uid}`);
    }
}
let handleUserleft=(user)=>{
    delete remoteUsers[user.uid];
    let userRemoved=document.getElementById(`user-container-${user.uid}`);
    if(userRemoved)
    {
        userRemoved.remove();
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
    await client.publish(localTracks);

}
joinRemoteRoom();