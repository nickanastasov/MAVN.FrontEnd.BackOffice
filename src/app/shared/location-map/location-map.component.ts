import {Component, OnInit, Output, EventEmitter, Input, SimpleChanges, OnChanges} from '@angular/core';
import {Marker} from './marker.interface';
import {AddressChangedEvent} from './models/address-changed-event.interface';

@Component({
  selector: 'app-location-map',
  templateUrl: './location-map.component.html',
  styleUrls: ['./location-map.component.scss'],
})
export class LocationMapComponent implements OnInit, OnChanges {
  @Input() mapAddress: string;
  // lat = 48.856614;
  // lng = 2.3522219;
  @Input()
  lat: number = null;
  @Input()
  lng: number = null;
  zoom = 1.5;

  markers: Marker[] = [];
  map: any;
  geocoder: any;

  @Output() mapMarkerAddress = new EventEmitter<AddressChangedEvent>();

  constructor() {}
  ngOnInit(): void {}

  handleMapReady(mapInstance: any) {
    this.map = mapInstance;
    const wdw: any = window;
    this.geocoder = new wdw.google.maps.Geocoder();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (propName === 'mapAddress') {
        // update the component here

        if (changes[propName].currentValue) {
          this.geocoder.geocode({address: changes[propName].currentValue}, (results: any, status: any) => {
            if (status === 'OK') {
              this.map.setCenter(results[0].geometry.location);

              this.lat = results[0].geometry.location.lat();
              this.lng = results[0].geometry.location.lng();

              this.markers.push({
                lat: this.lat,
                lng: this.lng,
                draggable: true,
              });

              this.mapMarkerAddress.emit({
                Address: null,
                Latitude: this.lat,
                Longitude: this.lng,
              });

              this.zoom = 15;
            } else {
              console.error('Geocode was not successful for the following reason: ' + status);
              // alert('Geocode was not successful for the following reason: ' + status);
            }
          });
        }
      } else if (propName === 'lat' && changes[propName].firstChange) {
        if (changes[propName].currentValue) {
          this.zoom = 15;
        }
      }
    }
  }

  mapClicked($event: any) {
    this.markers.push({
      lat: $event.coords.lat,
      lng: $event.coords.lng,
      draggable: true,
    });

    this.lat = $event.coords.lat;
    this.lng = $event.coords.lng;

    this.geocoder.geocode({location: {lat: this.lat, lng: this.lng}}, (results: any, status: any) => {
      if (status === 'OK') {
        this.map.setCenter(results[0].geometry.location);

        this.lat = results[0].geometry.location.lat();
        this.lng = results[0].geometry.location.lng();

        this.mapMarkerAddress.emit({
          Address: results[0].formatted_address,
          Latitude: this.lat,
          Longitude: this.lng,
        });
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  }
}
