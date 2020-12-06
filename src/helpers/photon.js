import HomeIcon from "@material-ui/icons/Home";
import PublicIcon from "@material-ui/icons/Public";
import LocationCityIcon from "@material-ui/icons/LocationCity";
import RoadIcon from "mdi-material-ui/Road";

export const photonToIcon = (photon) => {
  if (!photon) return null;
  const { type } = photon.properties;
  switch (type) {
    case "street":
      return RoadIcon;
    case "house":
      return HomeIcon;
    case "city":
      return LocationCityIcon;
    case "country":
    case "locality":
    case "region":
      return PublicIcon;
    default:
      return null;
  }
};

export const photonToString = (photon) => {
  if (!photon) return "";
  const { type, name, city, country, street, housenumber } = photon.properties;
  switch (type) {
    case "label":
      return name;
    case "street":
      return [name, city, country].filter(Boolean).join(", ");
    case "house":
      const address = [housenumber, street].filter(Boolean).join(" ");
      return [name, address, city, country].filter(Boolean).join(", ");
    case "country":
      return country;
    case "locality":
    case "region":
    case "city":
      return [name, country].filter(Boolean).join(", ");
    default:
      console.log("Couldn't parse result", photon);
      return name || "";
  }
};
