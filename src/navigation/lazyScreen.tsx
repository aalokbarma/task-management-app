import React, { ComponentType, lazy, Suspense } from 'react';
import { Loader } from '../components';

export function lazyScreen<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
): ComponentType<P> {
  const LazyComponent = lazy(loader);

  return function LazyScreen(props: P): React.JSX.Element {
    return (
      <Suspense fallback={<Loader fullscreen />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
