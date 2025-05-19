export interface WeatherRequestDTO {
    city: string;
}

export interface WeatherQueryResponse {
    city: string;
    result: any; // or define a more precise structure if desired
    createdAt: string;
  }
  