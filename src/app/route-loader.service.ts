import { Injectable } from "@angular/core";
import { ModulesService } from "@solenopsys/lib-globals";
import { loadRemoteModule } from "@angular-architects/module-federation";

import { Select, Store } from "@ngxs/store";
import { Cluster, ClusterState } from "@solenopsys/lib-clusters";
import { Observable } from "rxjs";
import { LoadingComponent, staticRoutes } from "./app.module";
import { NavigationStart, Router } from "@angular/router";


const loadMod = (host, key, path): any => {
  console.log("PATCH",path)
  let remoteEntry = host + `/fm/modules/${path}/remoteEntry.js`;
  console.log("RE",remoteEntry)
  return {

    path: key,
    loadChildren:
      () => loadRemoteModule({

        remoteEntry: remoteEntry,
        type: "module",
        exposedModule: "./Module"
      })
        .then(m => {
          return m.RemoteEntryModule;
        })

  };
};



@Injectable({
  providedIn: "root"
})
export class RouteLoaderService {

  @Select(ClusterState.getCurrent) current$!: Observable<Cluster>;
  loaded={}



  constructor(
    private modulesService: ModulesService,
    private router: Router,
    private store: Store
  ) {
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        console.log("URL",event.url)
        const rs = staticRoutes;

        let strings = event.url.split("/");
        console.log("STRINGS",strings)
        let first=strings[1]
        console.log("FIRST",first)
        if(first!="" && !this.loaded[first]){
          let path = "alexstorm/"+first;


          let cluster = this.store.selectSnapshot(ClusterState.getCurrent);
          let hostUrl = "http://" + cluster.host;
          console.log("HOST FOR LOAD",hostUrl)
          rs.push(loadMod(hostUrl, first, path)); //todo убрать этот костыль

          this.router.resetConfig([...rs,{ path: '**', component: LoadingComponent }]);
          this.loaded[first]=true;
        this.router.navigate([first])
        }

      }
    });

  }

  load() {
    console.log("LOAD ROUTER START");

    this.current$.subscribe(cluster => {
      let hostUrl = "http://" + cluster.host;
      this.modulesService.loadModules(hostUrl).then((names: string[]) => {
        console.log("LOAD MODULE START", names);

        // const rs = staticRoutes;
        // names.forEach(name => {
        //    rs.push(loadMod(hostUrl, name.replace("alexstorm/", ""), name)); //todo убрать этот костыль
        // });
        // this.router.resetConfig(rs);
       // console.log("ROUTE UPDATE",rs);
      });
    });


  }
}
