import { useState, useEffect } from 'react';
import {
  getStudioLocation,
  getCachedLocation,
  type StudioLocation,
} from '@/lib/studio-location';

const HeroSEO = () => {
  // Location comes from the single admin-editable studio setting so the
  // homepage SEO retargets automatically if the studio moves.
  const [loc, setLoc] = useState<StudioLocation>(() => getCachedLocation());
  useEffect(() => {
    let live = true;
    getStudioLocation().then((l) => {
      if (live) setLoc(l);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <>
      <h1 className="sr-only">
        Fashion, Beauty &amp; Editorial Photographer in {loc.city}, {loc.stateCode} | Jeff Honforloco
      </h1>
      <p className="sr-only">
        Fashion, beauty, editorial, headshot and commercial photography for brands, creators,
        models and professionals. Based in {loc.city}, {loc.state} and available for travel.
      </p>
    </>
  );
};

export default HeroSEO;
