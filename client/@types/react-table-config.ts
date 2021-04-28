/* eslint-disable @typescript-eslint/ban-types */
// This file is used to configure react table
// Reference: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-table

import {
  UsePaginationInstanceProps,
  UsePaginationOptions,
  UseSortByColumnOptions,
  UseSortByColumnProps,
  UseSortByHooks,
  UseSortByInstanceProps,
  UseSortByOptions,
  UseSortByState,
  UseGlobalFiltersColumnOptions,
  UseGlobalFiltersInstanceProps,
  UseGlobalFiltersOptions,
  UseGlobalFiltersState,
} from 'react-table';

declare module 'react-table' {
  export interface TableOptions<D extends object>
    extends UseSortByOptions<D>,
      UsePaginationOptions<D>,
      UseGlobalFiltersOptions<D>,
      // note that having Record here allows you to add anything to the options, this matches the spirit of the
      // underlying js library, but might be cleaner if it's replaced by a more specific type that matches your
      // feature set, this is a safe default.
      Record<string, unknown> {}

  // eslint-disable-next-line
  export interface Hooks<D extends object> extends UseSortByHooks<D> {}

  export interface TableInstance<D extends object>
    extends UsePaginationInstanceProps<D>,
      UseSortByInstanceProps<D>,
      UseGlobalFiltersInstanceProps<D> {}

  export interface ColumnInterface<D extends object>
    extends UseSortByColumnOptions<D>,
      UseGlobalFiltersColumnOptions<D>,
      UseGlobalFiltersOptions<D> {}

  export interface TableState<D extends object>
    extends UsePaginationState<D>,
      UseSortByState<D>,
      UseGlobalFiltersState<D> {}

  // eslint-disable-next-line
  export interface ColumnInstance<D extends object> extends UseSortByColumnProps<D> {}
}
