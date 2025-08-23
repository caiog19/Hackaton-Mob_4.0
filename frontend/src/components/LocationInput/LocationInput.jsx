import React from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import './LocationInput.css'; 

const LocationIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 10.5C21 17.5 12 23 12 23C12 23 3 17.5 3 10.5C3 6.35786 7.02944 3 12 3C16.9706 3 21 6.35786 21 10.5Z" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 13C13.3807 13 14.5 11.8807 14.5 10.5C14.5 9.11929 13.3807 8 12 8C10.6193 8 9.5 9.11929 9.5 10.5C9.5 11.8807 10.6193 13 12 13Z" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

export default function LocationInput({ onSelect, placeholder, initialValue = "" }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
  });

  React.useEffect(() => {
    setValue(initialValue, false);
  }, [initialValue, setValue]);


  const handleSelect = (address) => async () => {
    setValue(address, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const coords = await getLatLng(results[0]);
      onSelect({ description: address, coords });
    } catch (e) {
      console.error("Error fetching location", e);
    }
  };

  return (
    <div className="location-input-container">
      <div className="rp-input-wrapper">
        <LocationIcon />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          placeholder={placeholder}
        />
      </div>
      {status === 'OK' && (
        <ul className="suggestions-list-rp">
          {data.map((suggestion) => (
            <li key={suggestion.place_id} onClick={handleSelect(suggestion.description)}>
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}