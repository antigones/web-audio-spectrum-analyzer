// var colors = ['#0099ff', 'aquamarine','yellow','#ff3399','#009999'];
var colors = ['#C0E6DE','#7B8CDE','#9999C3','#BB999C','#E88D67']
const FFT_SIZE = 32;
const N_BARS = 5;
var max_size = 200;
var initial_padding = 12;

var cur_div = 'outer-container';
    for (var i=0; i<N_BARS; i++) {
        var iDiv = document.createElement('div');
        iDiv.id = 'container'+i;
        iDiv.className = 'block';
        iDiv.style.height = max_size +"px";
        iDiv.style.width = max_size +"px";
        iDiv.style.position = 'absolute';
        if (i > 0) {
            iDiv.style.padding = initial_padding + "px";
            //initial_padding = initial_padding + 1;
        }
        document.getElementById(cur_div).appendChild(iDiv);  
        cur_div = iDiv.id;
        max_size = max_size - 25;
    }
    var bars = []
    for (var i=0;i<N_BARS;i++) {
        bars[i] =new ProgressBar.Circle("#container"+i, {
            strokeWidth: 5,
            color: colors[i % colors.length],
            trailColor: '#eee',
            trailWidth: 1,
            svgStyle: null,
            position: 'absolute',
          });
    }

function init() {
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }
    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {

        // First get ahold of the legacy getUserMedia, if present
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
        });
    }
    }
  
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var source;
var stream;

var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;

if (navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');
    var constraints = {audio: true}
    navigator.mediaDevices.getUserMedia (constraints)
       .then(
         function(stream) {
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            //analyser.connect(audioCtx.destination);
            visualize();
       })
       .catch( function(err) { console.log('The following gUM error occured: ' + err);})
 } else {
    console.log('getUserMedia not supported on your browser!');
 }

 
 function visualize() {
    analyser.fftSize = FFT_SIZE;
    var bufferLengthAlt = analyser.frequencyBinCount;
    var dataArrayAlt = new Uint8Array(bufferLengthAlt);

    var drawAlt = function() {   
        drawVisual = requestAnimationFrame(drawAlt);
        analyser.getByteFrequencyData(dataArrayAlt);
        var max = Math.max.apply(Math,dataArrayAlt);
        for (var i=0; i<N_BARS; i++) {
            bars[i].set(dataArrayAlt[i]/max);
        }   
    };
      drawAlt();
    }

}

