const express = require('express');
const app = express();
const ytdl = require("ytdl-core");
const ffmpeg = require('fluent-ffmpeg');
const {PassThrough} = require('stream');
const {spawn} = require('child_process');
var cookieParser = require('cookie-parser');
const e = require('express');
const fs = require('fs');

app.use(cookieParser())

const VideoListItem = [];
const AudioListItem = [];

app.get("/", async(req, res)=>{
  try {
    const param = req.query.url;

    const getId = await ytdl.getURLVideoID(`${param}`);
    // console.log(getId)

    const getUrl = await ytdl.getInfo(`https://www.youtube.com/watch?v=${getId}`);


    const audioFileRegex = /^audio/;
    const videoFileRegex = /^video/;

   const GetAudioFile = await getUrl.player_response.streamingData.adaptiveFormats.filter(obj => audioFileRegex.test(obj.mimeType) == true );
   const GetVideoFile = await getUrl.player_response.streamingData.adaptiveFormats.filter(obj => videoFileRegex.test(obj.mimeType) == true );

  const Video = GetVideoFile.forEach(function(item, index){
    VideoListItem.push({url:item.url, quality:item.qualityLabel, mimeType:item.mimeType, contentLength:Math.ceil(parseInt(item.contentLength)/1048576)});           
  })

  const Audio = GetAudioFile.forEach(function(item, index){
    AudioListItem.push({url:item.url, quality:item.quality, mimeType:item.mimeType, contentLength:Math.ceil(parseInt(item.contentLength)/1048576)});
  })

  res.cookie('VideoListItem', VideoListItem[0].url, {maxAge: 900000, httpOnly: true});
  res.cookie('AudioListItem', AudioListItem[0].url, {maxAge: 900000, httpOnly: true});

  const video = req.cookies.VideoListItem;
  console.log(video);

  return res.status(200).json({
      success:true,
      AudioListItem,
      VideoListItem,
    })

  } catch (error) {
    res.status(500).json({
        error:error.message,
        message:"Something went wrong"
    })
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server si running at PORT  ${PORT}`)
})
