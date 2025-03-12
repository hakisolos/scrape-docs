const axios = require("axios");
const https = require("node:https");
const fake = require("fake-useragent");
const FormData = require("form-data");
const crypto = require("crypto-js");
const sharp = require("sharp");
const fs = require("node:fs");

const KEY = _randomChar(16);
const BASE = "https://imgedit.ai/background-remover";
const UPLOAD = "https://upload.imgedit.ai/api/v1/files/uploadImgs"
const TASK = "https://imgedit.ai/api/v1/draw-task"

const UPLOAD_ID = _randomChar(11);
const RED_PANDA_HASH = _randomChar(10);
const RED_PANDA_FILENAME = crypto.lib.WordArray.random(16).toString(crypto.enc.Hex) + ".jpg";
const RED_PANDA_UPLOAD = "https://briaai-bria-rmbg-2-0.hf.space/upload";
const RED_PANDA_QUEUE = "https://briaai-bria-rmbg-2-0.hf.space/queue/join";
const RED_PANDA_TASK = "https://briaai-bria-rmbg-2-0.hf.space/queue/data";

const PICSART_UPLOAD = "https://upload.picsart.com/files";
const PICSART_SOD = "https://ai.picsart.com/gw1/sod/v8.0.1";

// Karena tokennya bisa berubah suatu saat, jadi saya ubah manual aja kalo tokennya ganti lagi melalui API ini 😅. Jangan di DDOS ya nanti APInya mokad gak bisa dapetin tokennya lagi dong.
const FUSIONS_API = "https://go-scraper-production-ad35.up.railway.app/api/v1/picsart-token";

const REG_JS = /<script\ssrc=["'](\/_nuxt\/js\/[\w~-]+\.js)["']\s?defer\s?async><\/script>/gi;
const REG_AES = /var\saesKey\s?=\s?["'](\w{11,})['"]/i;
const REG_IV = /var\siv\s?=\s?["'](\w{11,})['"]/i;
const DEFAULT_KEY = {
  aes: "651cc172938d5b7799a23ac245e539a6",
  iv: "35e5cd2d684e5c65"
}

const agent = https.Agent({
  keepAlive: true,
  rejectUnauthorized: false
})

let headersList = {
  "authority": "upload.imgedit.ai",
  "accept": "application/json, text/plain, */*",
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6",
  "authorization": "null",
  "cache-control": "no-cache",
  "content-type": "application/json",
  "origin": "https://imgedit.ai",
  "pragma": "no-cache",
  "priority": "u=1, i",
  "referer": "https://imgedit.ai/",
  "sec-ch-ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "user-agent": fake()
}

let headersListRedPanda = {
  "authority": "briaai-bria-rmbg-2-0.hf.space",
  "accept": "application/json, text/plain, */*",
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6",
  "cache-control": "no-cache",
  "content-type": "application/json",
  "origin": "https://redpandaai.com",
  "pragma": "no-cache",
  "priority": "u=1, i",
  "referer": "https://redpandaai.com/",
  "sec-ch-ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "user-agent": fake()
  // "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
}

let headersListPicsart = {
  "authority": "upload.picsart.com",
  "accept": "*/*",
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6",
  "cache-control": "no-cache",
  "origin": "https://picsart.com",
  "pragma": "no-cache",
  "priority": "u=1, i",
  "referer": "https://picsart.com/",
  "sec-ch-ua": '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "user-agent": fake()
 }

function _randomChar(length) {
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }).map(_ => char.charAt(Math.floor(Math.random() * char.length))).join("");
}

function _delay(msec) {
  return new Promise(resolve => setTimeout(resolve, msec));
}

async function _req({ url, method = "GET", data = null, params = null, head = null, response = "json" }) {
  try {
    var headers = {};
    var param;
    var datas;

    if (head && head == "original" || head == "ori") {
      const uri = new URL(url);
      headers = {
        authority: uri.hostname,
        origin: "https://" + uri.hostname,
        'Cache-Control': 'no-cache',
        "user-agent": fake()
      }
    } else if (head && typeof head == "object") {
      headers = head;
    }
    if (params && typeof params == "object") {
      param = params;
    } else {
      param = "";
    }
    if (data) {
      datas = data
    } else {
      datas = "";
    }

    const options = {
      url: url,
      method: method,
      headers,
      timeout: 30_000,
      responseType: response,
      httpsAgent: agent,
      withCredentials: true,
      validateStatus: (status) => {
        return status <= 500;
      },
      ...(!datas ? {} : { data: datas }),
      ...(!params ? {} : { params: param })
    }
    const res = await axios.request(options);

    return res;
  } catch (error) {
    console.log(error)
  }
}

async function _fallbackToken() {
  console.log("[ FALLBACK ] Mencari token...")
  try {
    const res = await _req({
      url: BASE,
      method: "GET",
      head: "ori"
    })

    let js = res.data.matchAll(REG_JS);
    if (js) {
      js = Array.from(js, (v) => BASE.replace("/background-remover", "") + v[1]).reverse();
      for (let java of js) {
        const bearer = await _req({
          url: java,
          method: "GET",
          head: "ori"
        });

        const n = bearer.data.match(REG_AES)
        const s = bearer.data.match(REG_IV)
        if (s && n) {
          DEFAULT_KEY.aes = n[1];
          DEFAULT_KEY.iv = s[1];
          return { error: "" }
        } else {
          return { error: "[ 404 ] IV dan Kunci tidak ditemukan." }
        }
      }
    } else {
      return { error: "[ 404 ] Path javascript tidak ditemukan, kemungkinan regexpnya sudah ganti." }
    }
  } catch (err) {
    return { error: err }
  }
}

async function _upload(buffer) {
  try {
    const res = await _req({
      url: UPLOAD,
      method: "POST",
      data: {
        files_base64: `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`
      },
      params: {
        ekey: KEY,
        soft_id: "imgedit_web"
      },
      head: headersList
    })

    const dec = _decrypt(res.data.data);

    return dec;
  } catch (error) {
    return null
  }
}

async function _task(options, data = {}) {
  try {
    const opt = {
      "image_key_type": options?.image_key_type ? options.image_key_type : 3,
      "extra_image_key": data?.data?.paths[0],
      "template": options?.template ? options.template : "segment_common",
      "task_params": options?.task_params ? options.task_params : "background",
      "layout": options?.layout ? options.layout : 7
    }

    const res = await _req({
      url: TASK + "/al",
      method: "POST",
      data: opt,
      params: {
        ekey: KEY,
        soft_id: "imgedit_web"
      },
      head: headersList
    })

    const dec = _decrypt(res.data.data);

    return dec;
  } catch (error) {
    console.error(error)
    return null
  }
}

async function _proccess(data) {
  try {
    let result;

    while (true) {
      const res = await _req({
        url: TASK + "/" + data.data.serial_no,
        method: "GET",
        params: {
          ekey: KEY,
          soft_id: "imgedit_web"
        },
        head: headersList
      })

      const dec = _decrypt(res.data.data);

      if (Number(dec.data.queue_progress) > 0) {
        process.stdout.write(`\r[ QUEUE ] Waduh ngantri nih, kamu ke ${Number(dec.data.queue_progress) + 1}, sabar ya 😅`)
      }
      if (dec?.data?.detail?.path && dec?.data?.detail?.thumbnail_path) {
        result = dec;
        break;
      }

      await _delay(4_500)
    }

    return result;
  } catch (error) {
    console.error(error)
    return null
  }
}

function _decrypt(enc) {
  try {
    const key = crypto.enc.Utf8.parse(DEFAULT_KEY.aes);
    const iv = crypto.enc.Utf8.parse(DEFAULT_KEY.iv);

    const decipher = crypto.AES.decrypt(enc, key, {
      iv,
      mode: crypto.mode.CBC,
      padding: crypto.pad.Pkcs7
    })

    const jsn = JSON.parse(decipher.toString(crypto.enc.Utf8))
    return jsn
  } catch (error) {
    return null
  }
}

async function _redpandaUpload(buffer) {
  const form = new FormData();
  form.append("files", buffer, {
    filename: RED_PANDA_FILENAME,
    contentType: "image/jpeg"
  })

  const res = await _req({
    url: RED_PANDA_UPLOAD,
    method: "POST",
    data: form,
    params: {
      upload_id: UPLOAD_ID
    },
    head: {
      ...headersListRedPanda,
      ...form.getHeaders()
    }
  });

  return res.data;
}

async function _redpandaJoin(data, buffer) {
  const payload = {
    "data": [
      {
        "meta": {
          "_type": "gradio.FileData"
        },
        "path": data[0],
        "url": "https://briaai-bria-rmbg-2-0.hf.space/file=" + data[0],
        "orig_name": RED_PANDA_FILENAME,
        "size": buffer.length,
        "mime_type": "image/jpeg"
      }
    ],
    "event_data": null,
    "fn_index": 0,
    "trigger_id": 13,
    "session_hash": RED_PANDA_HASH
  }

  const res = await _req({
    url: RED_PANDA_QUEUE,
    method: "POST",
    data: payload,
    head: headersListRedPanda
  });

  return res.data;
}

function _redpandaQueue() {
  headersListRedPanda["accept"] = "text/event-stream"
  delete headersListRedPanda["content-type"];
  const result = []
  let i = 1;

  return new Promise(async resolve => {
    const res = await _req({
      url: RED_PANDA_TASK,
      method: "GET",
      params: {
        session_hash: RED_PANDA_HASH
      },
      response: "stream",
      head: headersListRedPanda
    });

    res.data.on("data", async (chunk) => {
      const strr = chunk.toString();
      strr.split("\n").forEach(str => {
        if (str) {
          jsn = JSON.parse(str.replace(/data:\s?/g, "").trim())
          result.push(jsn);
          if (jsn.msg == "close_stream") {
            resolve(result[result.length - 2]);
          }
        }
      })
    })
  })
}

async function _picsartUpload(buffer) {
  const form = new FormData();
  form.append("type", "web-editor")
  form.append("file", buffer, {
    filename: RED_PANDA_FILENAME,
    contentType: "image/jpeg"
  });
  form.append("url", "")
  form.append("metainfo", "");

  const res = await _req({
    url: PICSART_UPLOAD,
    method: "POST",
    data: form,
    head: {
      ...headersListPicsart,
      ...form.getHeaders()
    }
  });

  return res.data;
}

async function _picsartInit(){
  const res = await _req({
    url: FUSIONS_API,
    method: "GET",
    head: "ori"
  });
  
  headersListPicsart["x-app-authorization"] = "Bearer " + res.data.results.token;
  headersListPicsart["x-touchpoint"] = "widget_BackgroundRemover";
  headersListPicsart["x-touchpoint-referrer"] = "/background-remover/"
}

async function _picsartTask(buffer, data) {
  await _picsartInit();
  headersListPicsart["content-type"] = "application/json";

  const metadata = await sharp(buffer).metadata()

  const payload = {
    "photo_url": data.result.url,
    "output_width": metadata.width,
    "output_height": metadata.height
  }

  const res = await _req({
    url: PICSART_SOD,
    method: "POST",
    data: payload,
    head: headersListPicsart
  });

  return res.data;
}

async function RedPanda(image) {
  try {
    let buffer;

    if (typeof image == "string" && /https\:\/\/|http\:\/\//i.test(image)) {
      console.log("[ Red Panda ] Mengubah foto ke binary...")
      const kb = await _req({
        url: image,
        method: "GET",
        response: "arraybuffer",
        head: "ori"
      })
      buffer = Buffer.from(kb.data)
    } else {
      buffer = image;
    }

    console.log("[ Red Panda ] Mengupload...")
    const upload = await _redpandaUpload(buffer)
    await _redpandaJoin(upload, buffer)
    console.log("[ Red Panda ] Menghapus background...")
    const task = await _redpandaQueue()

    return task
  } catch (error) {
    return error
  }
}

async function ImageEdit(image, options) {
  try {
    let buffer, data;

    if (typeof image == "string" && /https\:\/\/|http\:\/\//i.test(image)) {
      console.log("[ Image Edit ] Mengubah foto ke binary...")
      const kb = await _req({
        url: image,
        method: "GET",
        response: "arraybuffer",
        head: "ori"
      })
      buffer = Buffer.from(kb.data)
    } else {
      buffer = image;
    }

    console.log("[ Image Edit ] Mengupload...")
    data = await _upload(buffer);
    if (data == null) {
      const status = await _fallbackToken();
      if (status.error) {
        return {
          message: "Gagal menghapus background"
        }
      }
      data = await _upload(buffer);
      if (data == null) {
        return {
          message: "Error bang, coba lagi, nanti"
        }
      }
    }

    console.log("[ Image Edit ] Membuat tugas...")
    const tsk = await _task(options, data)

    console.log("[ Image Edit ] Menghapus background...")
    const progress = await _proccess(tsk)

    return progress;
  } catch (error) {
    return error;
  }
}

async function PicsArt(image) {
  try {
    let buffer;

    if (typeof image == "string" && /https\:\/\/|http\:\/\//i.test(image)) {
      console.log("[ PicsArt ] Mengubah foto ke binary...")
      const kb = await _req({
        url: image,
        method: "GET",
        response: "arraybuffer",
        head: "ori"
      })
      buffer = Buffer.from(kb.data)
    } else {
      buffer = image;
    }

    console.log("[ PicsArt ] Mengupload...")
    const upload = await _picsartUpload(buffer);
    console.log("[ PicsArt ] Menghapus background...")
    const task = await _picsartTask(buffer, upload);

    const maskBuffer = await _req({
      url: task.result.alpha_url,
      method: "GET",
      response: "arraybuffer",
      head: "ori"
    });

    const sh = await sharp(buffer).composite([
      {
        input: Buffer.from(maskBuffer.data),
        blend: "dest-in"
      }
    ]).toBuffer()

    return {
      ...task,
      remove_buffer: sh
    }
  } catch (error) {
    return error
  }
}

/**
 * Cara penggunaan
 */
(async () => {
  const LINK = "https://i.pinimg.com/736x/e9/80/53/e9805385af1876a563b31babeabd8519.jpg";

  /**
   * Image Edit
   */
  // const OPTIONS = {
  //   image_key_type: 3,
  //   template: "segment_common",
  //   task_params: "background",
  //   layout: 7
  // }

  // const imgEdit = await ImageEdit(LINK, /* OPTIONS */) // options -> Opsional ( settingan default akan digunakan ).
  // console.log(JSON.stringify(imgEdit, null, 2))

  /**
   * Red Panda
   */
  // const redpanda = await RedPanda(LINK)
  // console.log(JSON.stringify(redpanda, null, 2))

  /**
   * Picsart
   */
  const picsart = await PicsArt(LINK)
  console.log(picsart)
  await fs.writeFileSync("result.jpg", picsart.remove_buffer);
  console.log("[ SAVE ] Foto disimpan di file result.jpg")
})()

module.exports = {
  ImageEdit,
  RedPanda,
  PicsArt
}
