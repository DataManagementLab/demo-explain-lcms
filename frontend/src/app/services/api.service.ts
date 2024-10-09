import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Plan from './data/plan';
import FullPlan from './data/full-plan';
import Prediction from './data/prediction';
import Explanation from './data/explanation';
import ImportantFeatures from './data/important-features';
import ExplainerType from './data/explainer-type';
import MostImportantNodeEvaluation from './data/most-important-node-evaluation';
import TableToScoreEvaluation from './data/table-to-score-evaluation';
import { of, tap } from 'rxjs';
import FidelityEvaluation from './data/fidelity-evaluation';
import CorrelationEvaluation from './data/correlation-evaluation';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseURL = 'http://127.0.0.1:8000/';

  constructor(private httpClient: HttpClient) {}

  getPlans() {
    return this.httpClient.get<Plan[]>(this.baseURL + 'plans');
  }

  getPlan(planId: number) {
    return this.httpClient.get<FullPlan>(this.baseURL + 'plans/' + planId);
  }

  getPrediction(planId: number) {
    return this.httpClient.get<Prediction>(
      this.baseURL + 'plans/' + planId + '/prediction',
    );
  }

  getExplanation(planId: number, explainerType: ExplainerType) {
    return this.httpClient.get<Explanation>(
      this.baseURL + 'plans/' + planId + '/explanation' + '/' + explainerType,
    );
  }

  private importantFeaturesCache: ImportantFeatures | undefined;
  getImportantFeatures() {
    if (this.importantFeaturesCache) {
      return of(this.importantFeaturesCache);
    }
    return this.httpClient
      .get<ImportantFeatures>(this.baseURL + 'important-features')
      .pipe(tap((value) => (this.importantFeaturesCache = value)));
  }

  getFidelityPlusEvaluation(planId: number, explainerType: ExplainerType) {
    return this.httpClient.get<FidelityEvaluation>(
      this.baseURL +
        'plans/' +
        planId +
        '/evaluation/' +
        explainerType +
        '/fidelity_plus',
    );
  }

  getFidelityMinusEvaluation(planId: number, explainerType: ExplainerType) {
    return this.httpClient.get<FidelityEvaluation>(
      this.baseURL +
        'plans/' +
        planId +
        '/evaluation/' +
        explainerType +
        '/fidelity_minus',
    );
  }

  getCorrelationEvaluation(planId: number, explainerType: ExplainerType) {
    return this.httpClient.get<CorrelationEvaluation>(
      this.baseURL +
        'plans/' +
        planId +
        '/evaluation/' +
        explainerType +
        '/correlation-node-importance',
    );
  }

  getMostImportantNodeEvaluationAll(explainerType: ExplainerType) {
    return this.httpClient.get<MostImportantNodeEvaluation>(
      this.baseURL + 'evaluation/' + explainerType + '/most-important-node',
    );
  }

  getFidelityEvaluationAll(explainerType: ExplainerType) {
    return this.httpClient.get<TableToScoreEvaluation>(
      this.baseURL + 'evaluation/' + explainerType + '/fidelity',
    );
  }

  getCostEvaluationAll(explainerType: ExplainerType) {
    return this.httpClient.get<TableToScoreEvaluation>(
      this.baseURL + 'evaluation/' + explainerType + '/cost',
    );
  }
}
