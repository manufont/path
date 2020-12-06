import React, { useEffect, useState, useMemo } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import queryString from "query-string";

import { bufferize } from "helpers/methods";
import { photonToIcon, photonToString } from "helpers/photon";
import { useResource } from "hooks";

import styles from "./SearchBox.module.css";

const PHOTON_URL = process.env.REACT_APP_PHOTON_URL;

const parsePhotonResults = (results) => results.features;

const SearchBox = ({ mapCenter, onPlaceSelect, defaultSearchText }) => {
  const [searchUrl, setSearchUrl] = useState(null);
  const [photons, loading, error] = useResource(searchUrl, parsePhotonResults);
  const [searchText, setSearchText] = useState(defaultSearchText);

  const bufferizedSetSearchUrl = useMemo(() => bufferize(setSearchUrl, 300), [setSearchUrl]);

  useEffect(() => {
    if (searchText.trim().length > 1) {
      const searchParams = queryString.stringify({
        q: searchText,
      });
      bufferizedSetSearchUrl(`${PHOTON_URL}/api?${searchParams}`);
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
          onChange={(e, value) => {
            setSearchText(photonToString(value));
            onPlaceSelect(value);
          }}
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
