let localStream;

// カメラ映像取得
navigator.mediaDevices.getUserMedia({video: true, audio: true})
  .then( stream => {
  // 成功時にvideo要素にカメラ映像をセットし、再生
  const videoElm = document.getElementById('my-video');
  videoElm.srcObject = stream;
  videoElm.play();
  // 着信時に相手にカメラ映像を返せるように、グローバル変数に保存しておく
  localStream = stream;
  // ミュート切替(自分)
  $(function() {
    var myaudioTrack = stream.getAudioTracks()[0];
    $('#muted').on('click', function() {
      if(myaudioTrack.enabled) {
        myaudioTrack.enabled = false;
      } else {
        myaudioTrack.enabled = true;
      }
    });
  });
}).catch( error => {
  // 失敗時にはエラーログを出力
  console.error('mediaDevice.getUserMedia() error:', error);
  return;
});

//Peer作成
const peer = new Peer({
key: '047c0c68-2d54-436d-8f0e-070ae4983ca5',
debug: 3
});

//PeerID取得
peer.on('open', () => {
  document.getElementById('my-id').textContent = peer.id;
});

// 発信処理
document.getElementById('make-call').onclick = () => {
const yourID = document.getElementById('your-id').value;
const mediaConnection = peer.call(yourID, localStream);
setEventListener(mediaConnection);
};

// イベントリスナを設置する関数
const setEventListener = mediaConnection => {
mediaConnection.on('stream', stream => {
  // video要素にカメラ映像をセットして再生
  const videoElm = document.getElementById('your-video')
  videoElm.srcObject = stream;
  videoElm.play();
});
}

//着信処理
peer.on('call', mediaConnection => {
mediaConnection.answer(localStream);
setEventListener(mediaConnection);
});

$(function() {

  // 音声ON(相手)(初期設定が音声OFFのため)
  var yoursettings = $('#your-video').get(0);
  yoursettings.muted = false;

  // 撮影機能
  var myvideo = document.getElementById('my-video');
  var yourvideo = document.getElementById('your-video');
  var mycanvas = document.getElementById('my-photo');
  var yourcanvas = document.getElementById('your-photo');

  var mycontext = mycanvas.getContext('2d');
  var yourcontext = yourcanvas.getContext('2d');

  var audio_start = new Audio('info-girl1_info-girl1-hazimemasu1.mp3');
  var audio_count = new Audio('info-girl1_info-girl1-countdown1.mp3');
  var audio_camera = new Audio('camera-shutter1.mp3');

  var start_flag = false;
  // シャッター押下時
  $('#shutter').on('click', function() {
    // 音声開始
    if (start_flag === false) {
      start_flag = true;

      audio_start.play();     // 始めます！

      setTimeout( () => {
        audio_count.play();   // 3、2、1、0！
      }, 2000);

      setTimeout( () => {
        audio_camera.play();  // シャッター音
        // 映像の停止
        myvideo.pause();
        yourvideo.pause();
        camera();
        download();
        start_flag = false;
      }, 5000);
    }
  });

  // 写真の撮影(canvasに描写)
  function camera () {

    // myphoto
    mycanvas.width = myvideo.videoWidth;
    mycanvas.height = myvideo.videoHeight;
    mycontext.drawImage(myvideo, 0, 0);

    // yourphoto
    yourcanvas.width = yourvideo.videoWidth;
    yourcanvas.height = yourvideo.videoHeight;
    yourcontext.drawImage(yourvideo, 0, 0);
  }

  // 撮影写真のダウンロード
  var i = 1;
  function download () {

    // myphoto
    // aタグを作成
    var myphoto = document.createElement('a');
    // canvasをJPEG変換
    myphoto.href = mycanvas.toDataURL('image/jpeg', 0.85);
    // ダウンロード時のファイル名を指定
    myphoto.download = 'myphoto_' + i + '.jpg';
    //クリックイベントを発生させる
    myphoto.click();

    // yourphoto
    // aタグを作成
    var yourphoto = document.createElement('a');
    // canvasをJPEG変換
    yourphoto.href = yourcanvas.toDataURL('image/jpeg', 0.85);
    // ダウンロード時のファイル名を指定
    yourphoto.download = 'yourphoto_' + i + '.jpg';
    // クリックイベントを発生させる
    yourphoto.click();

    i++;
    if (i > 50) {
      alert('撮影可能枚数の上限に達しました！');
    }
  }

  // 映像の切替(合成有無)
  $('#switching').on('click', function() {
    var mystreamElement = document.getElementById('my-stream');
    mystreamElement.classList.toggle('my-stream-mix');
    mystreamElement.classList.toggle('my-stream-normal');

    var yourstreamElement = document.getElementById('your-stream');
    yourstreamElement.classList.toggle('your-stream-mix');
    yourstreamElement.classList.toggle('your-stream-normal');

    var myvideoElement = document.getElementById('my-video');
    myvideoElement.classList.toggle('my-video-mix');
    myvideoElement.classList.toggle('my-video-normal');

    var yourvideoElement = document.getElementById('your-video');
    yourvideoElement.classList.toggle('your-video-mix');
    yourvideoElement.classList.toggle('your-video-normal');
  });

  // 撮影写真のクローズ・映像の再開
  $('#checkok').on('click', function() {
    mycontext.clearRect(0, 0, mycanvas.width, mycanvas.height);
    yourcontext.clearRect(0, 0, yourcanvas.width, yourcanvas.height);

    // 映像の停止
    myvideo.play();
    yourvideo.play();
  });

  // 料理の注文
  $('#delivery').on('click', function() {
    var deliverysiteElement = document.getElementById('delivery-site');
    deliverysiteElement.classList.toggle('delivery-display');
    deliverysiteElement.classList.toggle('delivery-none');
  });

});