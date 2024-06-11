// src/components/VideoCall.tsx
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

const VideoCall: React.FC = () => {
  const [peerId, setPeerId] = useState<string>('');
  const [remotePeerId, setRemotePeerId] = useState<string>('');
  const [callActive, setCallActive] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [videoStopped, setVideoStopped] = useState<boolean>(false);
  const [incomingCall, setIncomingCall] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const peerInstance = useRef<Peer | null>(null);
  const currentCall = useRef<Peer.MediaConnection | null>(null);

  useEffect(() => {
    // Initialize PeerJS
    const peer = new Peer();
    peerInstance.current = peer;

    peer.on('open', id => {
      setPeerId(id);
    });

    peer.on('call', call => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          localStream.current = stream;
          localVideoRef.current!.srcObject = stream;
          setIncomingCall(true);
          currentCall.current = call;
        })
        .catch(err => console.error('Failed to get local stream', err));
    });

    return () => {
      peer.disconnect();
    };
  }, []);

  const callPeer = (remoteId: string) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStream.current = stream;
        localVideoRef.current!.srcObject = stream;
        const call = peerInstance.current!.call(remoteId, stream);
        call.on('stream', remoteStream => {
          remoteVideoRef.current!.srcObject = remoteStream;
        });
        currentCall.current = call;
        setCallActive(true);
      })
      .catch(err => console.error('Failed to get local stream', err));
  };

  const toggleMute = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setMuted(!muted);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setVideoStopped(!videoStopped);
    }
  };

  const endCall = () => {
    if (currentCall.current) {
      currentCall.current.close();
      setCallActive(false);
      setIncomingCall(false);
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    if (remoteVideoRef.current) {
      (remoteVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
  };

  const acceptCall = () => {
    if (currentCall.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          localStream.current = stream;
          localVideoRef.current!.srcObject = stream;
          currentCall.current!.answer(stream);
          currentCall.current!.on('stream', remoteStream => {
            remoteVideoRef.current!.srcObject = remoteStream;
          });
          setCallActive(true);
          setIncomingCall(false);
        })
        .catch(err => console.error('Failed to get local stream', err));
    }
  };

  return (
    <div>
      <div>
        <video ref={localVideoRef} autoPlay muted></video>
        <video ref={remoteVideoRef} autoPlay></video>
      </div>
      <div>
        <p>Your ID: {peerId}</p>
        <input 
          type="text" 
          value={remotePeerId} 
          onChange={(e) => setRemotePeerId(e.target.value)} 
          placeholder="Remote Peer ID"
        />
        <button onClick={() => callPeer(peerId)} disabled={callActive}>Call</button>
        <button style={{backgroundColor: 'red', color: 'white'}} onClick={endCall} disabled={!callActive}>End Call</button>
        <button onClick={toggleMute} disabled={!callActive}>
          {muted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={toggleVideo} disabled={!callActive}>
          {videoStopped ? 'Start Video' : 'Stop Video'}
        </button>
        {incomingCall && (
          <button style={{backgroundColor: "green"}} onClick={acceptCall}>Accept Call</button>
        )}
      </div>
    </div>
  );
};

export default VideoCall;










// import React, { useEffect, useRef, useState } from "react";
// import Peer from "peerjs";

// const VideoCall: React.FC = () => {
//   const [peerId, setPeerId] = useState<string>("");
//   const [remotePeerId, setRemotePeerId] = useState<string>("");
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const peerInstance = useRef<Peer | null>(null);

//   useEffect(() => {
//     const peer = new Peer();
//     peerInstance.current = peer;

//     peer.on("open", (id) => {
//       setPeerId(id);
//     });

//     peer.on("call", (call) => {
//       navigator.mediaDevices
//         .getUserMedia({ video: true, audio: true })
//         .then((stream) => {
//           localVideoRef.current!.srcObject = stream;
//           call.answer(stream);
//           call.on("stream", (remoteStream) => {
//             remoteVideoRef.current!.srcObject = remoteStream;
//           });
//         })
//         .catch((err) => console.error("Failed to get local stream", err));
//     });

//     return () => {
//       peer.disconnect();
//     };
//   }, []);

//   const callPeer = (remoteId: string) => {
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         localVideoRef.current!.srcObject = stream;
//         const call = peerInstance.current!.call(remoteId, stream);
//         call.on("stream", (remoteStream) => {
//           remoteVideoRef.current!.srcObject = remoteStream;
//         });
//       })
//       .catch((err) => console.error("Failed to get local stream", err));
//   };

//   return (
//     <div>
//       <div>
//         <video ref={localVideoRef} autoPlay muted></video>
//         <video ref={remoteVideoRef} autoPlay></video>
//       </div>
//       <div>
//         <p>Your ID: {peerId}</p>
//         <input
//           type="text"
//           value={remotePeerId}
//           onChange={(e) => setRemotePeerId(e.target.value)}
//           placeholder="Remote Peer ID"
//         />
//         <button onClick={() => callPeer(remotePeerId)}>Call</button>
//       </div>
//     </div>
//   );
// };

// export default VideoCall;
