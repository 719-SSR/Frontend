/**
 * WebRTC流处理模块
 * 基于腾讯云TCPlayer实现WebRTC流播放
 */
class WebRTCStreamManager {
    constructor() {
        this.player = null;
        this.defaultWebRTCUrl = 'webrtc://global-lebtest-play.myqcloud.com/live/lebtest?txSecret=f22a813b284137ed10d3259a7b5c224b&txTime=69f1eb8c&tabr_bitrates=d1080p,d540p,d360p&tabr_start_bitrate=d1080p';
        this.licenseUrl = 'https://license.vod2.myqcloud.com/license/v2/1309287591_1/v_cube.license';
        this.isConnected = false;
    }

    // 连接WebRTC流
    async connectStream(videoElementId = 'webrtcVideo', webrtcUrl = null) {
        const url = webrtcUrl || this.defaultWebRTCUrl;
        
        if (!url) {
            this.updateStatus('请设置WebRTC流地址', 'warning');
            return false;
        }

        // 断开现有连接
        this.disconnectStream();

        this.updateStatus('正在连接WebRTC流...', 'info');

        try {
            // 检查TCPlayer是否可用
            if (typeof TCPlayer === 'undefined') {
                console.error('TCPlayer未加载');
                this.updateStatus('TCPlayer播放器未加载', 'error');
                return false;
            }

            // 创建TCPlayer实例
            this.player = TCPlayer(videoElementId, {
                sources: [{
                    src: url,
                    type: 'application/x-mpegURL'
                }],
                licenseUrl: this.licenseUrl,
                
                autoplay: true,
                poster: '',
                width: '100%',
                height: '450px',
                
                // WebRTC 相关配置
                webrtcConfig: {
                    connectRetryCount: 3,  // 重连次数
                    connectRetryDelay: 1000, // 重连间隔
                },
                
                // 监听事件
                listener: (msg) => {
                    this.handlePlayerEvent(msg);
                }
            });
            
            console.log('WebRTC TCPlayer初始化成功');
            this.isConnected = true;
            return true;

        } catch (error) {
            console.error('WebRTC连接失败:', error);
            this.updateStatus(`连接失败: ${error.message}`, 'error');
            
            // 备用方案：使用原生video标签
            console.log('尝试使用原生播放器作为备用方案');
            this.fallbackToNativePlayer(videoElementId);
            return false;
        }
    }

    // 处理播放器事件
    handlePlayerEvent(msg) {
        try {
            console.log('WebRTC播放器事件:', msg.type, msg);
            
            switch(msg.type){
                case 'error':
                    console.error('WebRTC播放错误:', msg);
                    this.updateStatus('WebRTC播放错误', 'error');
                    this.isConnected = false;
                    break;
                case 'playing':
                    console.log('WebRTC开始播放');
                    this.updateStatus('WebRTC连接成功，正在播放', 'success');
                    this.isConnected = true;
                    break;
                case 'pause':
                    console.log('WebRTC暂停播放');
                    break;
                case 'ended':
                    console.log('WebRTC播放结束');
                    this.isConnected = false;
                    break;
                case 'loadstart':
                    console.log('WebRTC开始加载');
                    this.updateStatus('正在加载WebRTC流...', 'info');
                    break;
                case 'loadeddata':
                    console.log('WebRTC加载完成');
                    this.updateStatus('WebRTC流加载完成', 'success');
                    break;
                case 'waiting':
                    console.log('WebRTC缓冲中...');
                    break;
            }
        } catch (e) {
            console.error('WebRTC事件处理错误:', e);
        }
    }

    // 备用播放方案
    fallbackToNativePlayer(videoElementId) {
        try {
            const video = document.getElementById(videoElementId);
            if (video) {
                video.style.display = 'block';
                // 可以添加其他原生播放逻辑
                console.log('已切换到原生video播放器');
            }
        } catch (error) {
            console.error('备用播放器初始化失败:', error);
        }
    }

    // 断开连接
    disconnectStream() {
        if (this.player) {
            try {
                // TCPlayer的销毁方法
                if (typeof this.player.destroy === 'function') {
                    this.player.destroy();
                } else if (typeof this.player.dispose === 'function') {
                    this.player.dispose();
                }
                console.log('WebRTC流已断开');
            } catch (error) {
                console.error('断开WebRTC流时出错:', error);
            }
            this.player = null;
        }
        this.isConnected = false;
        this.updateStatus('WebRTC连接已断开', 'info');
    }

    // 暂停播放
    pause() {
        if (this.player && typeof this.player.pause === 'function') {
            this.player.pause();
        }
    }

    // 恢复播放
    play() {
        if (this.player && typeof this.player.play === 'function') {
            this.player.play();
        }
    }

    // 设置音量
    setVolume(volume) {
        if (this.player && typeof this.player.volume === 'function') {
            this.player.volume(volume);
        }
    }

    // 获取连接状态
    getConnectionStatus() {
        return this.isConnected;
    }

    // 更新状态显示
    updateStatus(message, type = 'info') {
        console.log(`[WebRTC] ${message}`);
        
        // 尝试使用toastr显示状态，如果不存在则只输出到控制台
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
        } else {
            // 如果toastr不可用，使用浏览器原生通知或简单的alert
            console.warn('Toastr not available, message:', message);
        }
    }

    // 初始化检查
    async initialize() {
        // 等待TCPlayer库加载完成
        let retries = 0;
        const maxRetries = 50;
        
        while (typeof TCPlayer === 'undefined' && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }

        if (typeof TCPlayer === 'undefined') {
            console.error('TCPlayer库加载超时');
            this.updateStatus('TCPlayer播放器库加载失败', 'error');
            return false;
        }

        console.log('WebRTC流管理器初始化成功');
        return true;
    }

    // 设置WebRTC地址
    setWebRTCUrl(url) {
        this.webrtcUrl = url || this.defaultWebRTCUrl;
    }

    // 获取默认WebRTC URL列表
    getDefaultUrls() {
        return [
            'webrtc://global-lebtest-play.myqcloud.com/live/lebtest?txSecret=f22a813b284137ed10d3259a7b5c224b&txTime=69f1eb8c&tabr_bitrates=d1080p,d540p,d360p&tabr_start_bitrate=d1080p',
            'webrtc://localhost:8080/live/test'
        ];
    }

    // 检查浏览器WebRTC支持
    checkWebRTCSupport() {
        const isSupported = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
        if (!isSupported) {
            this.updateStatus('您的浏览器不支持WebRTC功能', 'error');
        }
        return isSupported;
    }
}

// 全局WebRTC流管理器实例
window.webrtcManager = new WebRTCStreamManager(); 