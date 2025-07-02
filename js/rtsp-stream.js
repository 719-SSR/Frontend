/**
 * RTSP流处理模块
 * 基于WebRTC-Streamer实现RTSP流播放
 */
class RTSPStreamManager {
    constructor() {
        this.webRtcStreamer = null;
        this.defaultRtspUrl = 'rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream';
        this.serverUrl = 'http://localhost:8000';
    }

    // 设置RTSP地址
    setRtspUrl(url) {
        this.rtspUrl = url || this.defaultRtspUrl;
    }

    // 连接流
    async connectStream(videoElementId = 'rtspVideo', rtspUrl = null, options = '') {
        const url = rtspUrl || this.rtspUrl || this.defaultRtspUrl;
        
        if (!url) {
            this.updateStatus('请设置RTSP流地址', 'warning');
            return false;
        }

        // 断开现有连接
        this.disconnectStream();

        this.updateStatus('正在连接RTSP流...', 'info');

        try {
            // 检查WebRTC支持
            if (!window.RTCPeerConnection) {
                this.updateStatus('您的浏览器不支持WebRTC功能', 'error');
                return false;
            }

            // 检查WebRtcStreamer类是否可用
            if (typeof WebRtcStreamer === 'undefined') {
                console.error('WebRtcStreamer类未找到！');
                this.updateStatus('WebRTC-Streamer库未加载', 'error');
                return false;
            }

            // 创建WebRTC-Streamer实例
            this.webRtcStreamer = new WebRtcStreamer(videoElementId, this.serverUrl);
            console.log('WebRtcStreamer实例创建成功');

            // 监听视频事件
            this.setupVideoEvents(videoElementId);

            // 连接到RTSP流
            this.webRtcStreamer.connect(url, "", options);
            console.log('RTSP连接命令已发送:', url);

            return true;

        } catch (error) {
            console.error('RTSP连接失败:', error);
            this.updateStatus(`连接失败: ${error.message}`, 'error');
            return false;
        }
    }

    // 设置视频事件监听器
    setupVideoEvents(videoElementId) {
        const video = document.getElementById(videoElementId);
        if (!video) {
            console.error('未找到视频元素:', videoElementId);
            return;
        }

        video.onloadstart = () => {
            console.log('RTSP视频开始加载');
        };

        video.onloadedmetadata = () => {
            console.log(`RTSP视频元数据加载完成 - ${video.videoWidth}x${video.videoHeight}`);
        };

        video.onloadeddata = () => {
            console.log('RTSP视频数据加载完成');
            this.updateStatus('RTSP连接成功，正在播放视频流', 'success');
        };

        video.oncanplay = () => {
            console.log('RTSP视频可以播放');
        };

        video.onplay = () => {
            console.log('RTSP视频开始播放');
        };

        video.onerror = (e) => {
            console.error('RTSP视频错误:', e);
            this.updateStatus('RTSP视频播放错误', 'error');
        };

        video.onwaiting = () => {
            console.log('RTSP视频缓冲中...');
        };
    }

    // 断开连接
    disconnectStream() {
        if (this.webRtcStreamer) {
            try {
                this.webRtcStreamer.disconnect();
                console.log('RTSP流已断开');
            } catch (error) {
                console.error('断开RTSP流时出错:', error);
            }
            this.webRtcStreamer = null;
        }
        this.updateStatus('RTSP连接已断开', 'info');
    }

    // 更新状态显示
    updateStatus(message, type = 'info') {
        console.log(`[RTSP] ${message}`);
        
        // 尝试使用toastr显示状态
        if (typeof toastr !== 'undefined') {
            switch (type) {
                case 'success':
                    toastr.success(message);
                    break;
                case 'error':
                    toastr.error(message);
                    break;
                case 'warning':
                    toastr.warning(message);
                    break;
                default:
                    toastr.info(message);
            }
        }
    }

    // 初始化WebRTC
    async initialize() {
        // 检查WebRTC支持
        if (!window.RTCPeerConnection) {
            this.updateStatus('您的浏览器不支持WebRTC功能', 'error');
            return false;
        }

        // 等待WebRTC-Streamer库加载完成
        let retries = 0;
        const maxRetries = 50;
        
        while (typeof WebRtcStreamer === 'undefined' && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }

        if (typeof WebRtcStreamer === 'undefined') {
            console.error('WebRtcStreamer类加载超时');
            this.updateStatus('WebRTC-Streamer库加载失败', 'error');
            return false;
        }

        console.log('RTSP流管理器初始化成功');
        return true;
    }

    // 获取默认RTSP URL列表
    getDefaultUrls() {
        return [
            'rtsp://stream.strba.sk:1935/strba/VYHLAD_JAZERO.stream',
            'rtsp://rtspstream:jNQoVgriRmI08TnF_DLQt@zephyr.rtsp.stream/movie',
            'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',
            'rtsp://localhost:8554/yourStream'
        ];
    }
}

// 全局RTSP流管理器实例
window.rtspManager = new RTSPStreamManager(); 