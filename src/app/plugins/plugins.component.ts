import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import {
  AddHelmRepository,
  Chart,
  HelmRepositoriesState,
  LoadFilteredChartsRepository,
  LoadRepositories,
  RemoveHelmRepository,
  Repo
} from "@solenopsys/lib-helm";
import {
  AddInstallation, DeleteInstallation,
  HelmInstallerService,
  InstallationsState,
  LoadInstallations
} from "@solenopsys/lib-installer";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";


//import {webSocket} from "rxjs/webSocket";

@Component({
  selector: "hyperconverged-plugins",
  templateUrl: "./plugins.component.html",
  styleUrls: ["./plugins.component.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class PluginsComponent implements OnInit {
  @Select(HelmRepositoriesState.getRepositories) repos$!: Observable<Repo[]>;
  @Select(HelmRepositoriesState.getCharts) charts$!: Observable<Chart[]>;
  @Select(HelmRepositoriesState.getFilter) filter$: Observable<string>;
  repoName: string;
  repoUrl: string;

  @Select(InstallationsState.getInstallation) installation$!: Observable<Chart[]>;

  constructor(  private is: HelmInstallerService, private store: Store) {
  }

  ngOnInit(): void {
    this.store.dispatch(LoadRepositories);
    this.store.dispatch(LoadInstallations);
  }

  send() {
    // let hStream = this.hStreamS.newStream("dgraph");
    // hStream.pipe().subscribe(message => {
    //   let str = new TextDecoder().decode(message);
    //   console.log("RESPONSE", str)
    // })
    //
    // var enc = new TextEncoder();
    // let data = enc.encode("{ results(func: uid(0x49be6)) \n  {\n    uid   content.group.fragment  " +
    //   " {uid fragment  versions  (orderdesc: version_date,first: 1)\n   " +
    //   " {uid   version_date blocks @facets(orderasc: ord)  {uid type   value before } }     }\n  } \n}");
    // hStream.send(data)
  }

  install(chart: Chart) {
    this.store.dispatch(new AddInstallation({
      name: chart.name,
      digest: chart.digest,
      version: chart.version,
      repository: "https://helm.alexstorm.solenopsys.org" //todo ???????????? ?????? ?????????? ?????????????????? alexstorm-helm-lookup  ?????? ???????????????????? ?????????? ?????? ??????????????????????
    }));
  }

  delete(name: string) {
    this.store.dispatch(new RemoveHelmRepository(name));
  }

  addRepo() {
    this.store.dispatch(new AddHelmRepository(this.repoUrl, this.repoName));
  }

  changedFilter(filter: string) {
    this.store.dispatch(new LoadFilteredChartsRepository(filter, false));
  }

  remove(chart: Chart) {
    this.store.dispatch(new DeleteInstallation({
      name: chart.name,
      digest: chart.digest,
      version: chart.version,
      repository: chart.repo
    }));
  }
}
