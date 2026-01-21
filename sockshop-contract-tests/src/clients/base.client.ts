import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * HTTP error with structured information
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseBody?: unknown,
    public readonly url?: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

/**
 * Base client configuration
 */
export interface BaseClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Abstract base HTTP client with common functionality
 */
export abstract class BaseClient {
  protected readonly client: AxiosInstance;
  protected readonly baseUrl: string;

  constructor(config: BaseClientConfig) {
    const { baseUrl, timeout = 10000, headers = {} } = config;

    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
    });
  }

  /**
   * Handle axios errors and convert to HttpError
   */
  protected handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status ?? 500;
      const responseBody = axiosError.response?.data;
      const url = axiosError.config?.url;

      throw new HttpError(
        `HTTP ${String(statusCode)}: ${axiosError.message}`,
        statusCode,
        responseBody,
        url
      );
    }

    if (error instanceof Error) {
      throw new HttpError(error.message, 500);
    }

    throw new HttpError('Unknown error occurred', 500);
  }

  /**
   * Perform GET request
   */
  protected async get<T>(path: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get<T>(path, config);
      return this.toApiResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Perform POST request
   */
  protected async post<T>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post<T>(path, data, config);
      return this.toApiResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Perform PUT request
   */
  protected async put<T>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put<T>(path, data, config);
      return this.toApiResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Perform DELETE request
   */
  protected async delete<T>(path: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete<T>(path, config);
      return this.toApiResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Convert axios response to API response
   */
  private toApiResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    const headers: Record<string, string> = {};
    Object.entries(response.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });

    return {
      data: response.data,
      status: response.status,
      headers,
    };
  }
}
