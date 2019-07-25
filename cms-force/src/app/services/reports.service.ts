import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MetricsData } from '../models/MetricsData';
import { EndpointsService } from '../constants/endpoints.service';
import { ModuleStoreService } from './module-store.service';
import { ReportsPageComponent } from '../components/reports-page/reports-page.component';
import { ReportsTimeGraphComponent } from '../components/reports-time-graph/reports-time-graph.component';
import { GlobalReports } from '../providers/GlobalReports';
import { Filter } from '../models/Filter';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  /** Standard HttpHeader object for application/json */
  private readonly HEADERS = new HttpHeaders({ 'Content-Type': 'application/json' });
  
  /** Milliseconds per year */
  private readonly MILLIS_PER_YEAR: number = 3.154e+10;

  /** Reports page component */
  reportsPage: ReportsPageComponent;
  /** Reports time graph component */
  reportsTimeGraph: ReportsTimeGraphComponent;

  /** TS variable that gets the moduleIDs we are sending back to the server to get average of */
  moduleIDs: number[] = [];
  
  loading: boolean = false;

  constructor(
    private http: HttpClient,
    private endpoints: EndpointsService,
    private ms: ModuleStoreService,
    private globalReports: GlobalReports) { }
  
  /**
   * sends the http request to the server to get the reports metrics data
   */
  getMetrics(filter: Filter) {
    
    this.loading = true;

    this.getIDsFromSubjects(this.ms.subjectNames);

    let body = {
      format: filter.getFormat(),
      modules: filter.getModules()
    };
    
    this.http.post(
      this.endpoints.GET_METRICS.replace('${timeFrame}', this.MILLIS_PER_YEAR.toString()),
      JSON.stringify(body),
      {
        headers: this.HEADERS
      }
      ).subscribe((result: MetricsData) => {
        this.globalReports.metricsData = result;
        this.reportsPage.updateMetrics(result);
        this.reportsTimeGraph.updateGraph(result.timeGraphData);
      },
      (err) => {
        console.log(err);
      },
      () => {
        this.loading = false;
      });
  }

  /**
    * Took this from another container
    * Gets the string array of selected subjects and populates
    * the number array of subject id (or model or tag or whatever the team never really settled on the name 
    * like it was tag at first then prerequisite then modules then affiliation then subjects like come on)
    * @param subjects
    */
  getIDsFromSubjects(subjects: string[]) {
    this.moduleIDs = [];
    if(subjects){
      subjects.forEach(
        (subject) => {
          this.moduleIDs.push(this.ms.subjectNameToModule.get(subject).id);
        }, this
      )
    }
  }
}
