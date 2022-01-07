const IPFS = require('ipfs');
const polka = require('polka');
const fileUpload = require('express-fileupload');
const bodyparser = require('body-parser');
const cors = require('cors');
const path = require('path');

const repoPath = path.resolve('./.ipfs');

let node;
IPFS.create({ repo: repoPath }).then(_node => {
  node = _node;
});

polka()
  .use(cors(), fileUpload(), bodyparser.json())
  .use((_req, res, next) => {
    res.json = data => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, PUT, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, Content-Type, X-Auth-Token'
    );
    next();
  })
  .post("/upload", async (req, res) => {
    console.log(req.files.undefined);
    // workaround as IPFS expects an object with either
    // a content or a path field. We have data and a null tempPath
    let pseudoFile = {
      ...req.files.undefined,
      content: req.files.undefined.data,
    };
    const data = await node.add(pseudoFile);
    return res.json({ hash: data.path });
  })
  .post('/uploadJSON', async (req, res) => {
    const body = req.body;
    const data = await node.add(JSON.stringify(body));
    return res.json({ hash: data.path });
  })
  .listen(process.env.PORT || 3000);
