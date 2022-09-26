import { useEffect, useState } from 'react';

interface Props {
  /**
   * where to fetch the initial data of ESS.
   */
  url: string;
  /**
   * what to display for user while loading
   */
  fallback?: JSX.Element;
  /**
   * what to display for user while loading error.
   */
  wrong?: JSX.Element;

  children: React.ReactElement;
}

/**
 * state of fetching
 *
 * - 0 - ready
 * - 1 - loading
 * - 2 - done
 * - 3 - error
 */
type FetchState = 0 | 1 | 2 | 3;

export const Fetch = (props: Props) => {
  const [state, setState] = useState<FetchState>(0);
  const [data, setData] = useState(null);

  useEffect(() => {
    setState(1);
    fetch(props.url)
      .then((r) => r.json())
      .then(
        (value) => {
          setState(2);
          setData(value);
        },
        () => {
          setState(3);
        },
      );
  }, [props.url]);

  useEffect(() => {
    console.log(props.children.props);
  }, [data, props.children]);

  switch (state) {
    case 0: {
      return <div>ready to load!</div>;
    }
    case 1: {
      return props.fallback || <Fetch.Fallback />;
    }
    case 2: {
      return props.children;
    }
    case 3: {
      return props.wrong || <Fetch.Wrong />;
    }
  }
};

Fetch.Fallback = () => {
  return <div>loading...</div>;
};

Fetch.Wrong = () => {
  return <div>something wrong!</div>;
};
