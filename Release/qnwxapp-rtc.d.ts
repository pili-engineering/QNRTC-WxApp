/// <reference types="node" />

import { EventEmitter } from 'events';

/**
 * 连接断开状态
 */
export declare interface QNConnectionDisconnectedInfo {
    /**
     * 连接断开原因
     */
    reason: QNConnectionDisconnectedReason;
    /**
     * 错误码
     */
    errorCode?: number;
    /**
     * 错误信息描述
     */
    errorMessage?: string;
}

/**
 * 连接断开原因
 */
export declare enum QNConnectionDisconnectedReason {
    /**
     * 主动退出
     */
    LEAVE = "LEAVE",
    /**
     * 被踢出房间
     */
    KICKED_OUT = "KICKED_OUT",
    /**
     * 发生错误，异常断开
     */
    ERROR = "ERROR"
}

/**
 * 房间连接状态
 */
export declare enum QNConnectionState {
    /**
     * 初始状态
     */
    DISCONNECTED = "DISCONNECTED",
    /**
     * 正在连接
     */
    CONNECTING = "CONNECTING",
    /**
     * 连接成功
     */
    CONNECTED = "CONNECTED",
    /**
     * 正在重连
     */
    RECONNECTING = "RECONNECTING",
    /**
     * 重连成功
     */
    RECONNECTED = "RECONNECTED"
}

/**
 * RTC 核心类
 */
declare class QNCore extends QNRTCClinetEvent {
}

/**
 * 自定义文本消息
 */
export declare interface QNCustomMessage {
    /**
     * 消息 ID
     */
    ID: string;
    /**
     * 用户 ID
     */
    userID: string;
    /**
     * 消息内容
     */
    content: string;
    /**
     * 时间戳
     */
    timestamp: number;
}

/**
 * 单路转推配置项
 */
export declare interface QNDirectLiveStreamingConfig extends QNLiveStreamingConfig {
    /**
     * 设置单路转推的视频 Track，仅支持设置一路视频 Track
     */
    videoTrack?: QNLocalTrack;
    /**
     * 设置单路转推的音频 Track，仅支持设置一路音频 Track
     */
    audioTrack?: QNLocalTrack;
}

/**
 * CDN 转推基础配置
 */
export declare interface QNLiveStreamingConfig {
    /**
     * 流任务 ID
     */
    streamID: string;
    /**
     * 推流地址
     */
    url: string;
}

/**
 * 本地轨
 */
export declare class QNLocalTrack extends QNTrack {
    /**
     * 设置静音状态
     * @param isMuted - 是否静音
     * @throws {@link ERROR_FATAL} 非预期错误
     * @throws {@link SERVER_ERROR} 服务器错误
     */
    setMuted(isMuted: boolean): Promise<void | undefined>;
}

/**
 * 日志等级
 */
export declare enum QNLogLevel {
    /**
     * VERBOSE 级别日志打印
     */
    VERBOSE = "VERBOSE",
    /**
     * INFO 级别日志打印
     */
    INFO = "INFO",
    /**
     * WARNING 级别日志打印
     */
    WARNING = "WARNING",
    /**
     * ERROR 级别日志打印
     */
    ERROR = "ERROR",
    /**
     * 关闭日志打印
     */
    NONE = "NONE"
}

/**
 *  Track 类型
 */
export declare enum QNMediaType {
    /**
     * 音频类型
     */
    audio = "audio",
    /**
     * 视频类型
     */
    video = "video"
}

/**
 * 发布后回调
 */
export declare type QNPublishCallback = (status: QNPublishStatus, data: QNPublishCallbackData) => void;

/**
 * 发布回调数据
 */
export declare interface QNPublishCallbackData {
    /**
     * 发布成功 Track
     */
    tracks?: QNLocalTrack[];
    /**
     * 推流地址
     */
    url?: string;
}

/**
 * 发布的状态
 */
export declare enum QNPublishStatus {
    /**
     * 预备，返回对应的 rtmp 地址
     */
    READY = "READY",
    /**
     * 连接完成，返回对应本地轨
     */
    COMPLETED = "COMPLETED",
    /**
     * 连接错误
     */
    ERROR = "ERROR"
}

/**
 * 远端轨
 */
export declare class QNRemoteTrack extends QNTrack {
    /**
     * 音视频轨静默状态改变
     * @event
     * @remarks 仅支持远端轨
     */
    static MUTE_STATE_CHANGED: "mute-state-changed";
}

/**
 * 远端用户
 */
export declare class QNRemoteUser {
    constructor(option: {
        userData: string;
        userID: string;
        audioTracks: QNRemoteTrack[];
        videoTracks: QNRemoteTrack[];
    });
    /**
     * 用户自定义数据
     */
    get userData(): string;
    /**
     * 用户 ID
     */
    get userID(): string;
    /**
     * 该用户发布的视频 track
     */
    getVideoTracks(): QNRemoteTrack[];
    /**
     * 该用户发布的音频 track
     */
    getAudioTracks(): QNRemoteTrack[];
}

/**
 * 拉伸模式
 */
export declare enum QNRenderMode {
    /**
     * 视频被拉伸以填充视图的大小，而不需要保持长宽比
     */
    FILL = "scaleToFit",
    /**
     * 视频通过保持长宽比来填充视图的大小。视频的某些部分可能被剪切
     */
    ASPECT_FILL = "aspectFill",
    /**
     * 通过保持宽高比(可能显示黑色边框)，视频被缩放以适应视图的大小
     */
    ASPECT_FIT = "aspectFit"
}

/**
 * RTC 入口
 */
declare class QNRTC {
    /**
     * 初始化 QNRTC 核心对象
     * @returns QNRTC 核心对象
     */
    static createClient(): QNRTCClient;
    /**
     * 获取版本号
     * @returns sdk版本号
     */
    static get VERSION(): string;
    /**
     * 设置日志打印等级
     * @param level 日志等级
     *
     */
    static setLogLevel(level: QNLogLevel): void;
    /**
     * 上报拉流状态
     * @since 4.0.2 当收到 live-player 组件报告的网络状态通知时，你可以调用该接口上传
     * @param e live-player 组件监听 bindnetstatus 事件触发的回调数据
     */
    static updatePlayerStateChange(e: any): void;
    /**
     * 上报拉流过程中的网络状态
     * @since 4.0.2 当收到 live-player 组件报告的拉流状态变化通知时，你可以调用该接口上传
     * @param e live-player 组件监听 bindstatechange 事件触发的回调数据
     */
    static updatePlayerNetStatus(e: any): void;
    /**
     * 上报推流状态
     * @since 4.0.2 当收到 live-pusher 组件报告的网络状态通知时，你可以调用该接口上传
     * @param e live-pusher 组件监听 bindnetstatus 事件触发的回调数据
     */
    static updatePusherStateChange(e: any): void;
    /**
     * 上报推流过程中的网络状态
     * @since 4.0.2 当收到 live-pusher 组件报告的推流状态变化通知时，你可以调用该接口上传
     * @param e live-pusher 组件监听 bindstatechange 事件触发的回调数据
     *
     */
    static updatePusherNetStatus(e: any): void;
}
export default QNRTC;

/**
 * RTC 核心类
 */
export declare class QNRTCClient extends QNCore {
    /**
     * 加入房间
     * @param token - 房间token
     * @param userData - 用户自定义信息
     * @throws {@link ERROR_FATAL} 解析roomtoken失败
     * @throws {@link ERROR_AUTH_FAILED} 初始化websocket失败
     * @throws {@link SERVER_ERROR} 服务端错误
     * @throws {@link JOIN_ROOM_ERROR} 加入房间错误
     */
    join(token: string, userData?: string): Promise<void>;
    /**
     * 离开房间
     * @throws {@link ERROR_FATAL} 非预期错误
     * @throws {@link ERROR_INVALID_STATE} 信令未初始化
     */
    leave(): Promise<void>;
    /**
     * 发布流
     * @param callback - 发布后回调
     */
    publish(callback: QNPublishCallback): Promise<void>;
    /**
     * 订阅流
     * @param tracks - 需要订阅的轨
     * @returns 拉流 RTMP 地址
     * @throws {@link ERROR_FATAL} 没有传入音视频轨
     */
    subscribe(tracks: QNSubscribeConfig): Promise<string>;
    /**
     * 发送自定义消息
     * @param messageID - 自定义消息 ID
     * @param message - 自定义消息内容
     * @param users - 默认群发，接收消息用户，传入值若为非数组或空数组，则会采用默认行为进行群发
     * @throws {@link ERROR_FATAL} 非预期错误
     * @throws {@link SERVER_ERROR} 服务器错误
     * @throws {@link ERROR_INVALID_PARAMETER} 非法参数
     */
    sendMessage(messageID: string, message: string, users?: QNRemoteUser[]): Promise<void>;
    /**
     * 开启单路转推
     * @param config - CDN转推参数
     * @throws {@link ERROR_FATAL} 非预期错误
     * @throws {@link SERVER_ERROR} 服务器错误
     * @throws {@link ERROR_INVALID_PARAMETER} 非法参数
     */
    startDirectLiveStreaming(config: QNDirectLiveStreamingConfig): Promise<void>;
    /**
     * 停止单路转推
     * @param streamID - CDN转推streamID
     * @throws {@link ERROR_FATAL} 非预期错误
     * @throws {@link SERVER_ERROR} 服务器错误
     * @throws {@link ERROR_INVALID_PARAMETER} 非法参数
     */
    stopDirectLiveStreaming(streamID: string): Promise<void>;
    /**
     * 开启合流转推
     * @param config - 合流转推参数
     * @throws {@link ERROR_FATAL} 非预期错误
     * @throws {@link SERVER_ERROR} 服务器错误
     * @throws {@link ERROR_INVALID_PARAMETER} 非法参数
     */
    startTranscodingLiveStreaming(config: QNTranscodingLiveStreamingConfig): Promise<void>;
    /**
     * 停止合流转推
     * @param streamID - 合流转推streamID
     * @throws {@link ERROR_FATAL} 非预期错误
     * @throws {@link SERVER_ERROR} 服务器错误
     * @throws {@link ERROR_INVALID_PARAMETER} 非法参数
     */
    stopTranscodingLiveStreaming(streamID: string): Promise<void>;
    /**
     * 新增、更新合流转推的布局
     * @param streamID - 合流转推streamID
     * @param transcodingTracks - 合流布局
     * @throws {@link ERROR_FATAL} 非预期错误
     * @throws {@link SERVER_ERROR} 服务器错误
     * @throws {@link ERROR_INVALID_PARAMETER} 非法参数
     */
    setTranscodingLiveStreamingTracks(streamID: string, transcodingTracks: QNTranscodingLiveStreamingTrack[]): Promise<void>;
    /**
     * 移除合流转推的布局
     * @param streamID - 合流转推streamID
     * @param transcodingTracks - 合流布局
     * @throws {@link ERROR_FATAL} 非预期错误
     * @throws {@link SERVER_ERROR} 服务器错误
     * @throws {@link ERROR_INVALID_PARAMETER} 非法参数
     */
    removeTranscodingLiveStreamingTracks(streamID: string, transcodingTracks: QNTranscodingLiveStreamingTrack[]): Promise<void>;
}

/**
 * QNRTCClient 事件
 */
declare class QNRTCClinetEvent extends EventEmitter {
    /**
     * 用户加入房间
     * @event
     */
    static USER_JOINED: "user-joined";
    /**
     * 用户离开房间
     * @event
     */
    static USER_LEFT: "user-left";
    /**
     * 用户添加媒体轨
     * @event
     */
    static USER_PUBLISHED: "user-published";
    /**
     * 用户移除媒体轨
     * @event
     */
    static USER_UNPUBLISHED: "user-unpublished";
    /**
     * 连接状态改变
     * @event
     */
    static CONNECTION_STATE_CHANGED: "connection-state-changed";
    /**
     * 信息接收
     * @event
     */
    static MESSAGE_RECEIVED: "message-received";
    addListener(event: typeof QNRTCClinetEvent.USER_JOINED, 
    /**
     * @param remoteUserID - 远端用户ID
     * @param userData - 用户自定义信息
     */
    listener: (remoteUserID: string, userData?: string) => void): this;
    addListener(event: typeof QNRTCClinetEvent.USER_LEFT, 
    /**
     * @param remoteUserID - 远端用户ID
     */
    listener: (remoteUserID: string) => void): this;
    addListener(event: typeof QNRTCClinetEvent.USER_PUBLISHED, 
    /**
     * @param track - 远端发布轨
     */
    listener: (userID: string, track: QNRemoteTrack | QNRemoteTrack[]) => void): this;
    addListener(event: typeof QNRTCClinetEvent.USER_UNPUBLISHED, 
    /**
     * @param track - 远端取消发布轨
     */
    listener: (userID: string, track: QNRemoteTrack | QNRemoteTrack[]) => void): this;
    addListener(event: typeof QNRTCClinetEvent.CONNECTION_STATE_CHANGED, 
    /**
     * @param connectionState - 连接状态
     * @param info - 连接信息
     */
    listener: (connectionState: QNConnectionState, info?: QNConnectionDisconnectedInfo) => void): this;
    addListener(event: typeof QNRTCClinetEvent.MESSAGE_RECEIVED, 
    /**
     * @param message - 自定义消息内容
     */
    listener: (message: QNCustomMessage) => void): this;
}

/**
 * 订阅设置
 */
export declare interface QNSubscribeConfig {
    /**
     * 视频轨
     */
    videoTrack?: QNRemoteTrack;
    /**
     * 音频轨
     */
    audioTrack?: QNRemoteTrack;
}

/**
 * 音视频轨
 */
export declare class QNTrack extends QNTrackEvent {
    constructor(option: {
        trackID: string;
        userID: string;
        tag: string;
        muted: boolean;
        kind: QNMediaType;
    });
    /**
     * Track ID
     */
    get trackID(): string;
    /**
     * 用户 ID
     */
    get userID(): string;
    /**
     * 自定义 tag 文本
     * @remarks
     * 小程序所发布的 Track 默认 tag 为 `debug`
     * 其余端 SDK 可以自行设置 tag
     * 小程序可以根据 tag 选择订阅 Track
     *
     */
    get tag(): string;
    /**
     * 是否被静音
     * @return 静音状态
     */
    isMuted(): boolean;
    /**
     * 判断是否为音频轨
     * @return 是否是音频轨
     */
    isAudio(): boolean;
    /**
     * 判断是否为视频轨
     * @return 是否是视频轨
     */
    isVideo(): boolean;
}

/**
 * QNTrack 事件
 */
declare class QNTrackEvent extends EventEmitter {
    /**
     * 音视频轨静默状态改变
     * @event
     * @remarks 仅支持远端轨
     */
    static MUTE_STATE_CHANGED: "mute-state-changed";
    addListener(event: typeof QNTrackEvent.MUTE_STATE_CHANGED, listener: () => void): this;
}

/**
 * 合流转推配置项
 */
export declare interface QNTranscodingLiveStreamingConfig extends QNLiveStreamingConfig {
    /**
     * 设置合流转推画布的宽
     */
    width?: number;
    /**
     * 设置合流转推画布的高
     */
    height?: number;
    /**
     * 设置合流转推的视频帧率
     */
    videoFrameRate?: number;
    /**
     * 设置合流转推的码率
     */
    bitrate?: number;
    /**
     * 设置合流转推的最小码率
     */
    minBitrate?: number;
    /**
     * 设置合流转推的最大码率
     */
    maxBitrate?: number;
    /**
     * 设置合流转推的合流布局
     */
    transcodingTracks?: QNTranscodingLiveStreamingTrack[];
    /**
     * 设置合流画面的填充方式
     */
    renderMode?: QNRenderMode;
    /**
     * 设置合流转推的画布背景
     */
    background?: QNTranscodingLiveStreamingImage;
    /**
     * 设置合流转推的水印
     */
    watermarks?: QNTranscodingLiveStreamingImage[];
    /**
     * 设置是否保持最后一帧
     */
    holdLastFrame?: boolean;
}

/**
 * 合流转推时，画布的背景图片配置
 */
export declare interface QNTranscodingLiveStreamingImage {
    /**
     * 设置图片地址
     */
    url: string;
    /**
     * 设置图片在合流画布中所在位置的 x 坐标
     */
    x: number;
    /**
     * 设置图片在合流画布中所在位置的 y 坐标
     */
    y: number;
    /**
     * 设置图片在合流画布中所在位置的宽
     */
    width: number;
    /**
     * 设置图片在合流画布中所在位置的高
     */
    height: number;
}

/**
 * 合流轨设置
 */
export declare interface QNTranscodingLiveStreamingTrack {
    /**
     * 参与合流的 trackID
     */
    trackID: string;
    /**
     * track 在合流画布中位置的 x 坐标
     */
    x?: number;
    /**
     * track 在合流画布中位置的 y 坐标
     */
    y?: number;
    /**
     * track 在合流画布中位置的层级
     */
    zOrder?: number;
    /**
     * track 在合流画布中相应位置的宽
     */
    width?: number;
    /**
     * track 在合流画布中相应位置的高
     */
    height?: number;
    /**
     * track 画面合流时的填充方式
     * @defaultValue `QNRenderMode.ASPECT_FILL`
     */
    renderMode?: QNRenderMode;
}

export { }
