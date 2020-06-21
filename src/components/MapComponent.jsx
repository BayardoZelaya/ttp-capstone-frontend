import React, { Component } from "react";
import { Map, GoogleApiWrapper, Marker, InfoWindow } from "google-maps-react";
import mapStyle from "../mapFolder/mapStyle";
import icon from "../accessories/images/wifi-pointer-before-selected.png";
import redPointer from "../accessories/images/red-pointer.png";
import { getHotSpots, getCloseHotSpots } from "../actions/hotspotActions";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import ListComponent from "./ListComponent";
import '../styles/mapStyle.css';
import axios from "axios";



class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: null,
      pointedLocation: null,
      selectedWifi: [],
      currentLocation: [],
      hotSpots: {},
      hotSpotsData: [],
      rerender : 1,
      centerLocation: {
        lat: 40.7128,
        lng: -74.006,
      },
      isLocated: false,
      isLoaded: null,
      loadError: null,
      showSelectedWifi: false,
      showCurrentL: true,
      showListInfo: false,
      selectedList: [],
    };
  }

  mapContainerStyle = {
    width: "100vw",
    height: "50vh",
  };


          componentDidMount() {


            var foundBorough = null
            var boroughBk = "Brooklyn";
            var boroughMan = "Manhattan";
            var boroughSI = "Staten Island"
            var boroughQ = "Queens";
            var boroughBx = "Bronx";


            navigator.geolocation.watchPosition((position) => {
              this.setState({
                currentLocation: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                },
                centerLocation: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                },
                isLocated: true,
                hotSpots:  this.props.hotSpot,
              });


              //Convert input location into borough
              const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
              axios
                  .get(url)
                  .then((response) =>{
                    const data =response.data;
                    console.log(data.results[0].address_components)
                    //Get address
                    let thelength  = data.results[0].address_components.length;
                    console.log( thelength )    

                    let i 

                    //Loop until matches a borough name                    
                    for( i = 0; i < thelength; i++)
                    {
                      if(foundBorough != null)
                          break;
                      if(data.results[0].address_components[i].long_name.includes(boroughBk ))
                          foundBorough = boroughBk
                      if(data.results[0].address_components[i].long_name.includes(boroughMan))
                          foundBorough = boroughMan
                      if(data.results[0].address_components[i].long_name.includes(boroughSI))
                          foundBorough = boroughSI
                      if(data.results[0].address_components[i].long_name.includes(boroughQ))
                          foundBorough = boroughQ
                      if(data.results[0].address_components[i].long_name.includes(boroughBx))
                          foundBorough = boroughBx
                    }
                    console.log("FOUND " + foundBorough)
                  })
                          .catch((err) =>{
                            console.log(err);
                          })
                    try{
                          this.props.getCloseHotSpots(foundBorough);
                    }
                    catch(err)
                    {
                      console.log(err)
                    }
            });
          this.setState({hotSpotsData: this.state.hotSpots.hotSpots})
          }


  listMarker = (id) => {  
      console.log(id);
      this.setState({centerLocation: {
        lat: this.state.hotSpotsData[id].latitude,
        lng: this.state.hotSpotsData[id].longitudes,
      },
      selectedList: this.state.hotSpotsData[id],
      listId: id,
      showCurrentL: false,
      showListInfo: true,
    })
  }
  render() {
    // const { hotSpots } = this.props.hotSpot;
    // console.log(this.state.hotSpotsData)
    console.log(this.state.centerLocation)
    return (

      <div className = "map">
        <Map
          google={this.props.google}
          style={this.mapContainerStyle}
          styles={mapStyle}
          zoom={14}
          disableDefaultUI={true}
          zoomControl={true}
          streetViewControl={true}
          center={{
            lat: this.state.centerLocation.lat,
            lng: this.state.centerLocation.lng,
          }}
                   
        >
          {this.state.hotSpotsData.map((hotSpot) =>  {
            return(              
                  <Marker
                    key={hotSpot._id}
                    position={{ lat: hotSpot.latitude, lng: hotSpot.longitudes }}
                    icon={{
                      url: icon,
                      scaledSize: new window.google.maps.Size(60, 60),
                    }}
                    onClick={() => {
                      this.setState({ selectedWifi: hotSpot, showSelectedWifi: true });
                       
                    }}
                    >
                    </Marker>
            )
          })}

            {/* displays user's location dialouge by default */}
            <InfoWindow
              visible={this.state.showCurrentL}
              position={{
                lat: this.state.currentLocation.lat,
                lng: this.state.currentLocation.lng,
              }}
              icon={{}}
              onClose={() => {
                this.setState({ showCurrentL: false });
              }}
            >
              <b>
                <p>You're here!</p>
              </b>
            </InfoWindow>
            <Marker
            position={{ lat: this.state.currentLocation.lat, lng: this.state.currentLocation.lng }}
            icon={{
              url: redPointer,
              scaledSize: new window.google.maps.Size(50,50),
             }}
             onClick = {(()=>{
              this.setState({showCurrentL: true});
             })}
            />

            {/* displays info window for wifi icon being clicked */}
            <InfoWindow
              visible={this.state.showSelectedWifi}
              position={{
                lat: this.state.selectedWifi.latitude,
                lng: this.state.selectedWifi.longitudes,
              }}
              onClose={() => {
                this.setState({ showSelectedWifi: false });
              }}
            >
              <div>
                <b>
                  <p>Wifi-Hotspot Info</p>
                </b>
                <ul>
                  <li>Name: {this.state.selectedWifi.name}</li>
                  <li>SSID: {this.state.selectedWifi.ssid}</li>
                  <li>Location: {this.state.selectedWifi.location}</li>
                  <li>ZipCode: {this.state.selectedWifi.zipcode}</li>
                  <li>Provider: {this.state.selectedWifi.provider}</li>
                  <li>Borough: {this.state.selectedWifi.boroughName}</li>
                  <li>Wifi-Session: {this.state.selectedWifi.type}</li>
                  {/* <li>Location-Type: outdoor</li> */}
                </ul>
                
              </div>
            </InfoWindow>
          
  <!--   displays info window when list is being clicked   -->
            <InfoWindow
              visible={this.state.showListInfo}
              position={{
                lat: this.state.centerLocation.latitude,
                lng: this.state.centerLocation.latitude,
              }}
              onClose={() => {
                this.setState({ showListInfo: false });
              }}
            >
              <div>
                <b>
                  <p>Wifi-Hotspot Info</p>
                </b>
                <ul>
                  <li>Name: {this.state.selectedList.name}</li>
                  <li>SSID: {this.state.selectedList.ssid}</li>
                  <li>Location: {this.state.selectedList.location}</li>
                  <li>ZipCode: {this.state.selectedList.zipcode}</li>
                  <li>Provider: {this.state.selectedList.provider}</li>
                  <li>Borough: {this.state.selectedList.boroughName}</li>
                  <li>Wifi-Session: {this.state.selectedList.type}</li>
                  {/* <li>Location-Type: outdoor</li> */}
                </ul>
                
              </div>
            </InfoWindow>
            <ListComponent wifiLists = {this.state.hotSpotsData} listMarker = {this.listMarker}/>

        </Map>
        <ListComponent wifiLists = {hotSpots} listMarker = {this.listMarker}/>
       
      </div>
    );
  }
}

MapComponent.propTypes = {
  getCloseHotSpots: PropTypes.func.isRequired,
  hotSpot: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  hotSpot: state.hotSpot,
});

export default connect(mapStateToProps, { getCloseHotSpots })(
  GoogleApiWrapper({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  })(MapComponent)
);
