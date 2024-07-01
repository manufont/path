import React, { useEffect, useState, useMemo } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import ClearIcon from "@mui/icons-material/Clear";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import queryString from "query-string";
import cn from "classnames";

import { bufferize } from "helpers/methods";
import { PhotonFeature, PhotonResponse, photonToIcon, photonToString } from "helpers/photon";
import { useResource, useDidUpdateEffect } from "hooks";

import styles from "./SearchBox.module.css";
import { LonLat } from "helpers/geo";

const PHOTON_URL = process.env.REACT_APP_PHOTON_URL;

const parsePhotonResults = (results: PhotonResponse) => results.features;

type SearchBoxProps = {
  mapCenter: LonLat;
  onPlaceSelect: (place: PhotonFeature) => void;
  defaultSearchText: string;
  setLocation: (location: LonLat | null) => void;
};

const SearchBox = ({
  mapCenter,
  onPlaceSelect,
  defaultSearchText,
  setLocation,
}: SearchBoxProps) => {
  const [searchUrl, setSearchUrl] = useState<string | null>(null);
  const [hideGeolocation, setHideGeolocation] = useState(!navigator.geolocation);
  const [photons, loading, error] = useResource<PhotonFeature[]>(searchUrl, parsePhotonResults);
  const [searchText, setSearchText] = useState(defaultSearchText);

  const bufferizedSetSearchUrl = useMemo(() => bufferize(setSearchUrl, 300), [setSearchUrl]);

  useEffect(() => {
    if (searchText.trim().length > 1) {
      const [lon, lat] = mapCenter;
      const searchParams = queryString.stringify({
        q: searchText,
        lon,
        lat,
      });
      bufferizedSetSearchUrl(`${PHOTON_URL}/api?${searchParams}`);
    } else {
      bufferizedSetSearchUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, bufferizedSetSearchUrl]);

  useDidUpdateEffect(() => {
    setSearchText(defaultSearchText);
  }, [setSearchText, defaultSearchText]);

  const geolocalize: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation([longitude, latitude]);
      },
      (error) => setHideGeolocation(true)
    );
  };

  const onInputClear = () => {
    setLocation(null);
    setSearchText("");
  };

  return (
    <Autocomplete
      freeSolo
      options={photons || []}
      getOptionLabel={(option) => (typeof option === "string" ? option : photonToString(option))}
      renderOption={(props, option) => {
        const Icon = photonToIcon(option);
        return (
          <li {...props}>
            <Icon className={styles.icon} /> {photonToString(option)}
          </li>
        );
      }}
      onInput={(e) => setSearchText((e.target as HTMLInputElement).value)}
      onChange={(e, value) => {
        setSearchText(photonToString(value as PhotonFeature));
        onPlaceSelect(value as PhotonFeature);
      }}
      value={{ properties: { type: "label", name: searchText } } as PhotonFeature}
      noOptionsText="No result found."
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          InputProps={{
            ...params.InputProps,
            className: cn(params.InputProps.className, styles.input),
            endAdornment: (
              <InputAdornment position="end">
                {searchText && (
                  <>
                    <IconButton onClick={onInputClear}>
                      <ClearIcon />
                    </IconButton>
                    {!hideGeolocation && (
                      <Divider orientation="vertical" className={styles.inputDivider} />
                    )}
                  </>
                )}
                {!hideGeolocation && (
                  <IconButton onClick={geolocalize}>
                    <GpsFixedIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
          error={error !== null}
          label={error === null ? "Enter your starting point" : String(error)}
          margin="normal"
          variant="outlined"
        />
      )}
    />
  );
};

export default SearchBox;
