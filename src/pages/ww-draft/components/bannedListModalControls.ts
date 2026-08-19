export const BANNED_LIST_MODAL_ID = "ww_banned_list_modal";

export const openBannedListModal = () =>
    (document.getElementById(BANNED_LIST_MODAL_ID) as HTMLDialogElement | null)?.showModal();

export const closeBannedListModal = () =>
    (document.getElementById(BANNED_LIST_MODAL_ID) as HTMLDialogElement | null)?.close();
