if (!process.env.DROPBOX_ACCESS_TOKEN) {
  throw 'Missing "DROPBOX_ACCESS_TOKEN" environment variable'
}
if (!process.env.DROPBOX_FOLDER) {
  throw 'Missing "DROPBOX_FOLDER" environment variable'
}
const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 5000
const Dropbox = require('dropbox-extra')
const dropbox = new Dropbox(process.env.DROPBOX_ACCESS_TOKEN)
const DROPBOX_FOLDER = process.env.DROPBOX_FOLDER
const cmd = require('node-cmd')

const syncDropbox = () => {
  try {
    cmd.get(
      'rm -rf public-temp && mkdir public-temp', (err, data, stderr) => {
        try {
          dropbox.sync(DROPBOX_FOLDER, 'public-temp', (err, cursor) => {
            try {
              cmd.run('rm -rf public && mv ./public-temp ./public')
          
              dropbox.sync(cursor)
            } catch (error) {}
          });
        } catch (error) {}
      }
    );
  } catch (error) {}
}

app.use(express.static(path.join(__dirname, 'public')))
app.get('/sync', (req, res) => {
  syncDropbox()
  res.json({
    message: 'Sync started'
  })
})

syncDropbox()

app.listen(PORT, () => console.log(`> Ready on http://localhost:${PORT}`))
