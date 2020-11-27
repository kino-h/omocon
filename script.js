let localStream;

// メニューボタンの切替(初期設定:非表示)
document.getElementById('mutedon').style.display = 'none';
document.getElementById('checkok').style.display = 'none';

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
    $('#mutedoff').on('click', function() {
      myaudioTrack.enabled = false;
      // メニューボタンの切替
      document.getElementById('mutedoff').style.display = 'none';
      document.getElementById('mutedon').style.display = 'inline-block';
    });
    $('#mutedon').on('click', function() {
      myaudioTrack.enabled = true;
      // メニューボタンの切替
      document.getElementById('mutedoff').style.display = 'inline-block';
      document.getElementById('mutedon').style.display = 'none';
    });
  });
}).catch( error => {
  // 失敗時にはエラーログを出力
  console.error('mediaDevice.getUserMedia() error:', error);
  return;
});

// ユーザ情報入力項目&ボタン(初期値)
function buttonreset() {
  document.getElementById("id-open").disabled = false;
  document.getElementById("my-id").disabled = false;
  document.getElementById("id-close").disabled = true;
  document.getElementById("your-id").disabled = true;
  document.getElementById("make-call").disabled = true;
}
buttonreset();

//Peer作成
$('#id-open').on('click', function() {
  const myID = document.getElementById('my-id').value;
  // ユーザ情報入力項目&ボタン
  document.getElementById("id-open").disabled = true;
  document.getElementById("my-id").disabled = true;
  document.getElementById("id-close").disabled = false; 
  document.getElementById("your-id").disabled = false;
  document.getElementById("make-call").disabled = false;

  const peer = new Peer(myID, {
  key: '047c0c68-2d54-436d-8f0e-070ae4983ca5',
  debug: 3
  });

  //Peer接続
  peer.on('open', () => {
    //
  });

  // 発信処理
  document.getElementById('make-call').onclick = () => {
    const yourID = document.getElementById('your-id').value;
    // ユーザ情報入力項目&ボタン
    document.getElementById("your-id").disabled = true;
    document.getElementById("make-call").disabled = true;
    
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

  //Peer切断
  $('#id-close').on('click', function() {
    peer.destroy();
    buttonreset();
  });

  peer.on('close', () => {
    alert('通信が切断しました。');
  });
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
        // メニューボタンの切替
        document.getElementById('shutter').style.display = 'none';
        document.getElementById('checkok').style.display = 'inline-block';
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
    // メニューボタンの切替
    document.getElementById('shutter').style.display = 'inline-block';
    document.getElementById('checkok').style.display = 'none';
  });

  // 会話続けさせたるちゃん
  var txt = new Array();
  txt[0]="来週、冬のボーナスが出るよ！";
  txt[1]="12月3日はみかんの日、妻の日、なんだって！";
  txt[2]="企画の加藤代理と大眉さんと河北さんは同期らしいよ";
  txt[3]="クリスマスまであと22日だよ！";
  txt[4]="2020年買ってよかったものを発表し合おう！";
  $('#sasetaruchan').on('click', function() {
    var max = 5; //メッセージ行数
    var txtno = Math.floor(Math.random() * max);
    $('#AItxt').html(txt[txtno]);
  });

  // 料理の注文
  $('#delivery').on('click', function() {
    var deliverysiteElement = document.getElementById('delivery-site');
    deliverysiteElement.classList.toggle('delivery-display');
    deliverysiteElement.classList.toggle('delivery-none');
  });

  // 時計
  function clock () {
    var twoDigit = function(num) {
      var digit
      if( num < 10 ){
        digit = "0" + num;
      } else {
        digit = num;
      }
      return digit;
    }

    var date = new Date();

    var year = date.getFullYear();
    var month = twoDigit(date.getMonth()+1);
    var day = twoDigit(date.getDate());
    var weeks = new Array("日","月","火","水","木","金","土");
    var week = weeks[date.getDay()];
    var hour = twoDigit(date.getHours());
    var minute = twoDigit(date.getMinutes());
    var second = twoDigit(date.getSeconds());
    $('.clock-date').html(year + "/" + month + "/" + day + " (" + week + ")");
    $('.clock-time').html(hour + ":" + minute + ":" + second);
  }
  setInterval(clock, 1000);
  
});