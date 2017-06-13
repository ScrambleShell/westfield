"use strict";
const wfc = require("./westfield-client-streams");
import RTPFactory from './rtp/factory.js';
import {SDPParser} from  "./parsers/sdp.js";
import {RTPPayloadParser} from "./rtp/payload/parser.js";

const connection = new wfc.Connection("ws://127.0.0.1:8080/westfield");
connection.registry.listener.global = (name, interface_, version) => {
    if (interface_ === "stream_source") {
        const streamSource = connection.registry.bind(name, interface_, version);
        setupDataChannels(streamSource);
    }
};

function setupDataChannels(streamSource) {

    const peerConnection = new RTCPeerConnection({
        'iceServers': [
            {'urls': 'stun:stun.services.mozilla.com'},
            {'urls': 'stun:stun.l.google.com:19302'},
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
        const channel = peerConnection.createDataChannel(streamSource.id, {ordered: false, maxRetransmits: 0});
        const rtpFactory = new RTPFactory(sdpParser);
        const rtpPayloadParser = new RTPPayloadParser();

        newStreamChannel(channel, rtpFactory, sdpParser, rtpPayloadParser);
    }).catch((error) => {
        console.error(error);
        throw new Error("Failed to parse SDP");
    });

    peerConnection.createOffer().then((desc) => {
        return peerConnection.setLocalDescription(desc);
    }).then(() => {
        streamSource.client_stream_description(JSON.stringify({"sdp": peerConnection.localDescription}));
    }).catch((error) => {
        console.error(error);
        streamSource.client.close();
    });
}

function newStreamChannel(receiveChannel,
                          rtpFactory,
                          sdpParser,
                          rtpPayloadParser) {
    receiveChannel.binaryType = "arraybuffer";
    receiveChannel.onmessage = function (event) {

        const rtpPacket = rtpFactory.build(new Uint8Array(event.data), sdpParser);
        const nal = rtpPayloadParser.parse(rtpPacket);

        console.log(nal);
    };
}




