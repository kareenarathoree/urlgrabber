const express = require('express');
const app = express();
const ytdl = require("ytdl-core");
require("dotenv").config({
  path:"./.env"
});


app.get("/", async(req, res)=>{
  try {
    const param = req.query.url;

    const getId = await ytdl.getURLVideoID(`${param}`);
    console.log(getId)

    const getUrl = await ytdl.getInfo(`https://www.youtube.com/watch?v=${getId}`);

    res.status(200).json({
      success:true,
      data:[{
        videoWithAudio:getUrl.player_response.streamingData.formats,
        videoWithoutAudio:getUrl.player_response.streamingData.adaptiveFormats
      }]
    })

  } catch (error) {
    res.status(200).json({
        error:error,
        message:"Something went wrong"
    })
  }
})



const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server si running at PORT  ${PORT}`)
})