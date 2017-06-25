"use strict";
const wfc = require("./westfield-client-streams");
import RTPFactory from './rtp/factory.js';
import {SDPParser} from  "./parsers/sdp.js";
import {RTPPayloadParser} from "./rtp/payload/parser.js";
import {Remuxer} from "./remuxer/newremuxer.js";


const connection = new wfc.Connection("ws://" + location.host + "/westfield");
connection.registry.listener.global = (name, interface_, version) => {
    if (interface_ === "stream_source") {
        const streamSource = connection.registry.bind(name, interface_, version);
        setupDataChannels(streamSource);
    }
};

function setupDataChannels(streamSource) {

    const peerConnection = new RTCPeerConnection({
        'iceServers': [
            {'urls': 'stun:stun.wtfismyip.com/'},
        ]
    });

    peerConnection.onicecandidate = (evt) => {
        if (evt.candidate !== null) {
            streamSource.client_stream_description(JSON.stringify({"candidate": evt.candidate}));
        }
    };

    streamSource.listener.server_stream_description = (description) => {

        const signal = JSON.parse(description);

        if (signal.sdp) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).catch((error) => {
                console.log("Error: Failure during setRemoteDescription()", error);
                connection.close();
            });
        } else if (signal.candidate) {
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(error => {
                console.log("Error: Failure during addIceCandidate()", error);
                connection.close();
            });
        }
    };

    const sdpParser = new SDPParser();
    sdpParser.parse(
        "v=0\n" +
        "m=video 5004 RTP/AVP 96\n" +
        "a=rtpmap:96 H264/90000\n").then(() => {

        const rtpFactory = new RTPFactory(sdpParser);
        const track = sdpParser.getMediaBlock("video");
        const video = document.getElementById("surface.123");
        const remuxer = new Remuxer(track);
        return remuxer.addVideo(video).then((mse) => {
            const channel = peerConnection.createDataChannel(streamSource.id, {ordered: false, maxRetransmits: 0});
            setupStreamChannel(channel, rtpFactory, sdpParser, remuxer, mse);
        });
    }).then(() => {
        return peerConnection.createOffer({
            offerToReceiveAudio: false,
            offerToReceiveVideo: false,
            voiceActivityDetection: false,
            iceRestart: false
        })
    }).then((desc) => {
        return peerConnection.setLocalDescription(desc);
    }).then(() => {
        streamSource.client_stream_description(JSON.stringify({"sdp": peerConnection.localDescription}));
    }).catch((error) => {
        console.error(error);
        streamSource.client.close();
    });
}

function setupStreamChannel(receiveChannel,
                            rtpFactory,
                            sdpParser,
                            remuxer,
                            mse) {
    const nalQueue = [];

    let newestRtp = 0;

    const rtpPayloadParser = new RTPPayloadParser();

    receiveChannel.binaryType = "arraybuffer";
    receiveChannel.onmessage = function (event) {
        const rtpPacket = rtpFactory.build(new Uint8Array(event.data), sdpParser);

        //TODO filter out packets that are x seconds older than the current time?

        //filter out rtp packets that are older than 41ms compared to the most recent rtp packet.
        const timestampDelta = newestRtp - rtpPacket.timestamp;
        if (timestampDelta > (90 * 35)) {
            return;
        } else if (timestampDelta < 0) {
            newestRtp = rtpPacket.timestamp;
        }

        if (mse.buffer === null || (mse.buffer.queue.length === 0)) {

            const nal = rtpPayloadParser.parse(rtpPacket);
            if (nal) {
                nalQueue.push(nal);
            }
            remuxer.flush(nalQueue);
        }
    };

    mse.onBuffer().then((buffer) => {
        remuxer.flush(nalQueue);
        buffer.flush = () => {
            remuxer.flush(nalQueue);
        };
    });
}




