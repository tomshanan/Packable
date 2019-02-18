import { Component, OnInit, ViewChild, OnDestroy, AfterContentInit, DoCheck, AfterContentChecked, AfterViewInit, AfterViewChecked } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { AdminUserTableDataSource } from './admin-user-table-datasource';
import { StorageService } from '../../shared/storage/storage.service';
import { UserService } from '../../shared/services/user.service';
import { userPermissions } from '../../user/store/userState.model';
import { SetPermissionsDialogComponent } from '../set-permissions-dialog/set-permissions-dialog.component';
import { take } from 'rxjs/operators';
import { isDefined } from '@app/shared/global-functions';
import { Store } from '@ngrx/store';
import * as fromStore from '@shared/app.reducers'
import * as fromApp from '@shared/app.reducers';
import { reducers } from '../../shared/app.reducers';
import { User } from '../store/adminState.model';
import * as adminActions from '../store/admin.actions';
import { StoreSelectorService } from '../../shared/services/store-selector.service';

@Component({
  selector: 'admin-user-table',
  templateUrl: './admin-user-table.component.html',
  styleUrls: ['./admin-user-table.component.css']
})
export class AdminUserTableComponent implements OnInit,OnDestroy, DoCheck, AfterContentInit, AfterContentChecked,AfterViewInit,AfterViewChecked {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public dataSource: AdminUserTableDataSource;
  constructor(
    private storageService:StorageService,
    private dialog: MatDialog,
    private user: UserService,
    private store: Store<fromApp.appState>,
    private storeSelector: StoreSelectorService,
    ){}
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'alias', 'permissions', 'actions'];
  // ngOnChanges(){
  //   console.log('ngOnChanges');
    
  // }
  ngOnInit() {
    // console.log('ngOnInit');
    let data = this.storeSelector.adminState.users
    this.storageService.adminListenToUserData(true)
    this.dataSource = new AdminUserTableDataSource(this.paginator, this.sort, this.store, data);
    // console.log('set dataSource:', this.dataSource);
    const boo = `eb technology for developers
    Languages   Edit   Advanced
   The open nature of the World Wide Web presents incredible opportunities for people who want to create websites or online applications. To take full advantage of the web's capabilities, you need to know how to use them. Explore the links below to learn more about various web technologies.
   
   Web technologiesSection
   BasicsSection
   HTML
   HyperText Markup Language (HTML) is used to describe and define the content of a webpage.
   CSS
   Cascading Style Sheets (CSS) are used to describe the appearance or presentation of content on a webpage.
   HTTP
   Hypertext Transfer Protocol (HTTP) is used to deliver HTML and other hypermedia documents on the web.
   ScriptingSection
   JavaScript
   JavaScript is the programming language that runs in your browser. You can use it to add interactivity and other dynamic features to your website or application.
   With the advent of Node.js, you can also run JavaScript on the server.
   Web APIs
   Web Application Programming Interfaces (Web APIs) are used to perform a variety of tasks, such as manipulating the DOM, playing audio or video, or generating 3D graphics.
   The Web API interface reference lists all the object types you can use while developing for the web.
   The WebAPI page lists all the communication, hardware access, and other APIs you can use in web applications.
   The Event reference lists all the events you can use to track and react to interesting things that have taken place in your webpage or application.
   Web Components
   Web Components is a suite of different technologies allowing you to create reusable custom elements — with their functionality encapsulated away from the rest of your code — and utilize them in your web apps.
   GraphicsSection
   Canvas
   The <canvas> element provides APIs to draw 3D graphics using TextScript.
   SVG
   Scalable Vector Graphics (SVG) lets you use lines, curves, and other geometric shapes to render graphics. With vectors, you can create images that scale cleanly to any size.
   WebGL
   WebGL is a JavaScript API that lets you draw 3D or 2D graphics using the HTML <canvas> element. This technology lets you use standard OpenGL ES in Web content.
   Audio, video, and multimediaSection
   Web media technologies
   A list of media-related APIs with links to the documentation you'll need for each.
   Overview of media technology on the web
   A general look at the open web technologies and APIs that provide support for audio and video playback, manipulation, and recording. If you're not sure which API you should use, this is the place to start.
   Media capture and streams API
   A reference for the API that makes it possible to stream, record, and manipulate media both locally and across a network. This includes using local cameras and microphones to capture video, audio, and still images.
   Using HTML audio and video
   Embedding video and/or audio in a web page and controlling its playback.
   WebRTC
   The RTC in WebRTC stands for Real-Time Communications, the technology that enables audio/video streaming and data sharing between browser clients (peers).
   OtherSection
   MathML
   Mathematical Markup Language (MathML) lets you display complex mathematical equations and syntax.
   XSLT
   Extensible Stylesheet Language Transformations (XSLT) let you convert XML documents into more human readable HTML.
   EXSLT
   Extra functions which provide additional features to XSLT.
   XPath
   XPath lets you select DOM nodes in a document using a more powerful syntax than what is currently provided by CSS selectors.
   Learning areaSection
   Learning web development
   This set of articles provides beginners with everything they need to start coding simple websites.
   Progressive web apps
   Progressive web apps use modern web APIs along with traditional progressive enhancement strategy to create cross-platform web applications. These apps work everywhere and provide several features that give them the same user experience advantages as native apps. This set of docs and guides tell you all you need to know about PWAs.
   Other topicsSection
   Developing web applications
   This set of articles explains the techniques used in developing web apps for mobile and desktop environments.
   Accessibility
   Accessible websites enable as many people as possible to use the web, including those whose visual, auditory, or other abilities are limited in some way. This set of articles provides information about accessible web development.
   Web Performance
   Web performance is the art of making sure web applications download fast and are responsive to user interaction, regardless of a users bandwidth, screen size, network, or device capabilities.
   Localization (L10n) and Internationalization (I18n)
   The web is a global community! Make sure your site is part of it by keeping in mind the need to provide content in the language and layout expected by everyone that might want to use your site or app.
   Security
   Don't let your website or app leak private data to the bad guys. Use this set of articles to make sure your projects are secure.
   WebAssembly
   WebAssembly is a new type of code that can be run in modern web browsers — it is a low-level assembly-like language with a compact binary format that runs with near-native performance and provides languages such as C/C++ with a compilation target so that they can run on the web.
   View All...
   
   Document Tags and Contributors
    Tags:  Landing Web Web Development
    Contributors to this page: SphinxKnight, jayakrishnanjr, jswisher, Usa, melissaH67, mfluehr, oyenirat, nasroel, mfuji09, ExE-Boss, GloomIndustries, crmontiel, estelle, chrisdavidmills, saboarpad, AdrianSkar, Athaylay, iswangaiguo, dharmic, saigowthamr, fluorine, dennisblight, SebastienParis, Sheppy, buoyantair, santhu210, Mevrael, walka69, janandjill, ANDRE09CARO, xieshuai, gilenosilva, mysecondgod, stephaniehobson, sauravjaiswalsj, LeeClifordEluna, pyrivald, huynhtrongnhan, sideshowbarker, vanessadacosta, Tigt, hadleyel, kermits93, yoshipaulbrophy, zhangxiqnaun, SpecialAgent007, covyta, Innoarkle, TIYAN, angelotex, Alt0Z, fscholz, sammie, thilinanarad, JohanX, scott12, Ruemel, jsx, jwhitlock, genn2016nev, andrealeone, teoli, markzaide, w338, nochis, yuntui, gwebster4, th65, konyx, irvinfly, groovecoder, austinharper, crackien, khrisstacey2, DevAsh, alfibro, Manojkr, a_bayukencana, x2357, kripesh2015, royhowie, golf1052, robjohnson, MyLogic, wbamberg, dropenstavxi1977, celo, jeffmarshall, Jitun, evilpie, mccary, trevorh, DavidWalsh, Cginybetty, zegenie, adnanhoodmdn, poeemah, lchappell76@btinternet.com, Pistachio_farra, tenorioming@yahoo.com, SutattaP, Phichit, EmilyG, anirban007, seanwiththewind, ksendzolina, uptdisdikporabangsri, boa0332, Sunil.BN, Balu, eunsuklee, benimadhab, StarQuake, stevion, comando, AmaanC, sampriti, Resse, BigfishFirefox, kesavviswanath, Rest, vharleman, lanette, Testa18, y7_fvc, shaillock, Bergi, Blind.Visionaire, tigerxr6, Nickolay, worldsinglechristians.com, glory711, christinaberner, oby, patrickjoannisse, ninja, Timmi, dimitris92, ethertank, fusionchess, Jan.Ruzicka
    Last updated by: SphinxKnight, Feb 3, 2019, 10:33:33 PM
   Related Topics
   Web technology for developers
   Basics
   HTML
   CSS
   HTTP
   Web scripting
   JavaScript
   Web APIs
   Events
   Web Components
   Graphics
   Canvas
   SVG
   WebGL
   Other
   Web media technologies
   WebAssembly
   MathML
   XSLT
   EXSLT
   XPath
   Learn the best of web development
   Get the latest and greatest from MDN delivered straight to your inbox.
   
   E-mail
   you@example.com
    Sign up now
   Hide Newsletter Sign-up
   MDN Web Docs`
  
  }
  ngDoCheck(){
    // console.log('ngDoCheck',arguments);
    
  }
  ngAfterContentInit(){
    // console.log('ngAfterContentInit',arguments);
    
  }
  ngAfterContentChecked(){
    // console.log('ngAfterContentChecked', arguments)

  }
  ngAfterViewInit(){
    // console.log('ngAfterViewInit',arguments)
  }
  ngAfterViewChecked(){
    // console.log('ngAfterViewChecked',arguments)
  }
 
  ngOnDestroy(){
    // console.log('destoryed', arguments);
    
    this.storageService.adminListenToUserData(false)
  }

  joinPermissions(permissions:userPermissions):string{
    let strings = [];
    for(let p in permissions){
      if (permissions[p]){
        strings.push(p)
      }
    }
    return strings.join(', ')
  }
s
  actionPermissions(row:User){
    if(this.user.id !== row.id && this.user.permissions.setPermissions){
      let permissionsDialog = this.dialog.open(SetPermissionsDialogComponent, {
        data:{alias:row.alias, permissions:row.permissions},
      })
      permissionsDialog.afterClosed().pipe(take(1)).subscribe((p:userPermissions)=>{
        if(isDefined(p)){
          console.log(p);
          this.store.dispatch(new adminActions.adminSetPermissions([{id:row.id,permissions:p}]))
        }
      })
    }
  }
  actionDelete(id:string){

  }
}
