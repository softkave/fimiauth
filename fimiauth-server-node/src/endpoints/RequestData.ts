import {IServerRequest} from '../contexts/types.js';
import {
  BaseTokenData,
  SessionAgent,
  kFimidaraResourceType,
} from '../definitions/system.js';
import {getNewIdForResource} from '../utils/resource.js';

export interface IRequestContructorParams<T = any> {
  req?: IServerRequest | null;
  data?: T;
  incomingTokenData?: BaseTokenData | null;
  agent?: SessionAgent | null;
}

export default class RequestData<T = any> {
  static fromExpressRequest(req: IServerRequest): RequestData<{}>;
  static fromExpressRequest<DataType = any>(
    req: IServerRequest,
    data: DataType
  ): RequestData<DataType>;
  static fromExpressRequest<DataType = any>(
    ...args: [IServerRequest] | [IServerRequest, DataType]
  ): RequestData<DataType> {
    const [req, data] = args;
    const requestData = new RequestData({
      req,
      data,
      incomingTokenData: req.auth,
    });

    return requestData;
  }

  static clone<T = undefined>(from: RequestData, data: T): RequestData<T> {
    return new RequestData({
      data,
      req: from.req,
      incomingTokenData: from.incomingTokenData,
      agent: from.agent,
    });
  }

  static merge<T>(from: RequestData, to: RequestData<T>) {
    return new RequestData<T>({
      req: from.req,
      data: to.data,
      incomingTokenData: from.incomingTokenData,
      agent: from.agent,
    });
  }

  requestId: string;
  req?: IServerRequest | null;
  data?: T;
  incomingTokenData?: BaseTokenData | null;
  agent?: SessionAgent | null;

  constructor(arg?: IRequestContructorParams<T>) {
    this.requestId = getNewIdForResource(kFimidaraResourceType.EndpointRequest);
    if (!arg) {
      return;
    }

    this.req = arg.req;
    this.data = arg.data;
    this.incomingTokenData = arg.incomingTokenData;
    this.agent = arg.agent;
  }

  getIp() {
    if (this.req) {
      return Array.isArray(this.req.ips) && this.req.ips.length > 0
        ? this.req.ips
        : [this.req.ip];
    }

    return [];
  }

  getUserAgent() {
    if (this.req) {
      return this.req.headers['user-agent'];
    }

    return null;
  }

  getSystemAuthId() {
    if (this.req) {
      return this.req.headers['x-system-auth-id'];
    }

    return null;
  }
}
