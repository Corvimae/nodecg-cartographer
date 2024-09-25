// Copy a bunch of React stuff
declare const UNDEFINED_VOID_ONLY: unique symbol;

type DependencyList = ReadonlyArray<unknown>;
type SetStateAction<S> = S | ((prevState: S) => S);
type Dispatch<A> = (value: A) => void;
type Destructor = () => void | { [UNDEFINED_VOID_ONLY]: never };
type EffectCallback = () => (void | Destructor);

interface MutableRefObject<T> {
  current: T;
}

type UseReplicantOptions<T> = {
  defaultValue?: T;
  bundle?: string;
  persistent?: boolean;
};

interface Cartographer {
  useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
  useMemo<T>(factory: () => T, deps: DependencyList | undefined): T;
  // eslint-disable-next-line @typescript-eslint/ban-types
  useCallback<T extends Function>(callback: T, deps: DependencyList): T;
  useRef<T = undefined>(initialValue?: T): MutableRefObject<T>;
  useEffect(effect: EffectCallback, deps?: DependencyList): void;
  useReplicant: <T, U = T>(
    replicantName: string,
    initialValue: U,
    options?: ReplicantOptions<T> & {namespace?: string},
  ) => [T | U, (newValue: T) => void];
  useListenFor: <T>(
    messageName: string,
    handler: (message: T) => void,
    options?: UseListenForOptions,
  ) => void;
  register: (id: string, renderer: function) => void;
}

declare const cartographer: Cartographer;
