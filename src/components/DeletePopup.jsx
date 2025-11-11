import { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDispatch, useSelector } from 'react-redux'


const DeletePopup = ({ item, delFn, children, loading: loadingOverride, onSuccess, open: controlledOpen, onOpenChange }) => {
    const dispatch = useDispatch()
    
    const inShipmentsLoading = useSelector(state => state.inShipments?.loading)
    const outShipmentsLoading = useSelector(state => state.outShipments?.loading)
    const [internalOpen, setInternalOpen] = useState(false)
    const loading = loadingOverride ?? inShipmentsLoading ?? outShipmentsLoading ?? false
    
    // Use controlled or uncontrolled mode
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? onOpenChange : setInternalOpen

    const handleDelete = async () => {
        const response = await dispatch(delFn(item.id))
        if (delFn.fulfilled.match(response)) {
            setOpen(false)
            onSuccess && onSuccess()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children && (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[625px] [&_[data-slot='dialog-close']]:!right-[95%]">
                <DialogHeader className="!text-start !py-2">
                    <DialogTitle>هل انت متأكد من حذفك لهذه البيانات ؟</DialogTitle>
                    <DialogDescription>
                        عند حذفك لتلك البيانات لن تستطيع استرجاعها ابدا , حيث سيتم محوها من قاعدة البيانات الخاصة بنا.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button disabled={loading} variant="outline" className="cursor-pointer !ring-0">الغاء</Button>
                    </DialogClose>
                    <Button disabled={loading} variant="destructive" className="cursor-pointer" onClick={handleDelete}>
                        {
                            loading
                                ?
                                <>
                                    <LoaderCircle className="animate-spin" />
                                    <span>حذف ...</span>
                                </>
                                :
                                <span>حذف</span>
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeletePopup