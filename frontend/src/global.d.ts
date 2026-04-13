declare global {
  type TProtectedRouteProps = {
    redirectPath?: string
  }

  interface IPropsDialog {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    onChanged?: (record: IProductRec) => void
  }

  interface IListResponse<T = Record<string, unknown>[]> {
    data: T
    count: number
  }

  interface IHeader {
    key: string
    title: string
    classes: string
  }

  interface IPagination {
    count: number
    offset: number
    limit: number
    onChange: (page: number) => void
  }
}

export {}
