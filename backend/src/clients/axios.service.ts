import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Service that abstracts Axios logic for safe API calls.
 */
@Injectable()
export class AxiosService {
    private readonly logger = new Logger(AxiosService.name);

    /**
     * Creates an Axios instance with a base URL
     */
    createInstance(baseURL: string): AxiosInstance {
        return axios.create({
            baseURL,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    /**
     * Handles Axios errors and provides meaningful messages
     */
    private handleAxiosError(error: unknown): never {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                throw new Error(`Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                throw new Error('Error: No response received from server');
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        } else {
            throw new Error('An unexpected error occurred');
        }
    }

    /**
     * Executes an Axios request safely
     */
    async makeRequest<T>(request: () => Promise<AxiosResponse<T>>): Promise<T> {
        try {
            const response = await request();
            if (response.status >= 200 && response.status < 300) {
                return response.data;
            } else {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
        } catch (error) {
            this.handleAxiosError(error);
        }
    }
}
