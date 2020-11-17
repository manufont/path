import React, { useEffect, useState, useMemo } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import HomeIcon from "@material-ui/icons/Home";
import PublicIcon from "@material-ui/icons/Public";
import LocationCityIcon from "@material-ui/icons/LocationCity";
import RoadIcon from "mdi-material-ui/Road";
import queryString from "query-string";

import { bufferize } from "helpers/methods";
import { useResource, useSearchState } from "hooks";

import styles from "./SearchBox.module.css";

const parsePhotonResults = (results) => results.features;

const photonToIcon = (photon) => {
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

const photonToString = (photon) => {
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

const SearchBox = ({ mapCenter, onPlaceSelect }) => {
  const [searchUrl, setSearchUrl] = useState(null);
  const [photons, loading, error] = useResource(searchUrl, parsePhotonResults);
  const [searchText, setSearchText] = useSearchState("q", "");

  const bufferizedSetSearchUrl = useMemo(() => bufferize(setSearchUrl, 300), [setSearchUrl]);

  useEffect(() => {
    if (searchText.trim().length > 1) {
      const searchParams = queryString.stringify({
        q: searchText,
      });
      bufferizedSetSearchUrl(`/photon/api?${searchParams}`);
    } else {
      bufferizedSetSearchUrl(null);
    }
  }, [searchText, bufferizedSetSearchUrl, mapCenter]);

  return (
    <Card>
      <CardContent>
        <Autocomplete
          freeSolo
          options={photons || []}
          getOptionLabel={photonToString}
          renderOption={(option) => {
            const Icon = photonToIcon(option);
            return (
              <span>
                <Icon className={styles.icon} /> {photonToString(option)}
              </span>
            );
          }}
          onInput={(e) => setSearchText(e.target.value)}
          onChange={(e, value) => onPlaceSelect(value)}
          value={{ properties: { type: "label", name: searchText } }}
          noOptionsText="No result found."
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              error={error !== null}
              label={error === null ? "Enter your starting point" : String(error)}
              margin="normal"
              variant="outlined"
            />
          )}
        />
      </CardContent>
    </Card>
  );
};

export default SearchBox;
