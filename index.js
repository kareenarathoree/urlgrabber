const express = require('express');
const app = express();
const ytdl = require("ytdl-core");
var cookieParser = require('cookie-parser');

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


  const filterVideo = await GetVideoFile.filter(ytData => {
    const quality = ytData.qualityLabel;
    return quality === '360p' || quality === '720p' || quality === '1080p';
  });

  
  const uniqueVideo = Array.from(new Set(filterVideo.map(video => video.qualityLabel))).map(quality => {
    return filterVideo.find(video => video.qualityLabel === quality);
  });


  const Video = uniqueVideo.forEach(function(item, index){
    VideoListItem.push({url:item.url, quality:item.qualityLabel, mimeType:item.mimeType, contentLength:Math.ceil(parseInt(item.contentLength)/1048576)});           
  })

  const Audio = GetAudioFile.forEach(function(item, index){
    AudioListItem.push({url:item.url, quality:item.quality,message:"I am Audio", mimeType:item.mimeType, contentLength:Math.ceil(parseInt(item.contentLength)/1048576)});
  })

  res.cookie('VideoListItem', VideoListItem[0].url, {maxAge: 900000, httpOnly: true});
  res.cookie('AudioListItem', AudioListItem[0].url, {maxAge: 900000, httpOnly: true});

  const video = req.cookies.VideoListItem;

  const AudioListItem1 = AudioListItem[0];

  return res.status(200).json({
      success:true,
      VideoListItem,
      AudioListItem1,
      // getUrl
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
