const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

function sendMessage() {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value;

  // Emit the chat message to the server with the sender's ID
  socket.emit("chat-message", { senderId: myPeer.id, message });

  // Clear the input field
  messageInput.value = "";
}

socket.on("chat-message", (data) => {
  displayChatMessage(data.senderId, data.message);
});

function displayChatMessage(senderId, message) {
  console.log("Received senderId:", senderId, "Your ID:", myPeer.id);

  const senderName = senderId === myPeer.id ? "You" : "Other User";
  const senderClass = senderId === myPeer.id ? "sender-local" : "sender-other";

  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML += `<p class="${senderClass}"><strong>${senderName}:</strong> ${message}</p>`;
  
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    // Flip the video horizontally
    video.style.transform = "scaleX(-1)";
    video.style.border = "2px solid black"; // Add a border around the video
    video.style.borderRadius = "10%"; // Make the video round
  });
  videoGrid.append(video);
}