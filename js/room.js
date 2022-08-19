let messagesContainer = document.getElementById('messages');
messagesContainer.scrollTop = messagesContainer.scrollHeight;

const memberContainer = document.getElementById('members__container');
const memberButton = document.getElementById('members__button');

const chatContainer = document.getElementById('messages__container');
const chatButton = document.getElementById('chat__button');

let activeMemberContainer = false;

memberButton.addEventListener('click', () => {
  if (activeMemberContainer) {
    memberContainer.style.display = 'none';
  } else {
    memberContainer.style.display = 'block';
  }

  activeMemberContainer = !activeMemberContainer;
});

let activeChatContainer = false;

chatButton.addEventListener('click', () => {
  if (activeChatContainer) {
    chatContainer.style.display = 'none';
  } else {
    chatContainer.style.display = 'block';
  }

  activeChatContainer = !activeChatContainer;
});

// expend the user
let boxFrame=document.getElementById("stream__box");
let videos=document.getElementsByClassName("video__container");
let userIdInDisplayFrame=null;
let expend=(e)=>{
  console.log("change")
  let child=boxFrame.children[0];
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


