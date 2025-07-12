import { useCallback } from "react";
import * as Util from '../utilities/';

export function usePatternPage(currentPage: number, setCurrentPage: (n: number) => void, drums: any[]) {
    return useCallback((numero_page: number) => {
        if (numero_page !== currentPage) {
            document.querySelectorAll('.span_survol').forEach(el => el.classList.remove('span_survol'));
            document.querySelectorAll('.span_active').forEach(el => el.classList.remove('span_active'));

            Util.Pattern.setPage(numero_page);
            setCurrentPage(numero_page);
            const listeButton = document.getElementsByClassName("button_set_nb_time");
            for (let i = 0; i < listeButton.length; i++) {
                listeButton[i].classList.remove("nb_time_active");
                if (listeButton[i].id === "show_page" + numero_page) {
                    listeButton[i].classList.add("nb_time_active");
                }
            }
            for (let i = 0; i < Util.Pattern.PatternArray.length; i++) {
                const listSpanByDrum = document.getElementsByClassName("sdd_" + drums[i].type);
                for (let j = 0; j < Util.Pattern.PatternArray[i].length; j++) {
                    Util.toggle_classes(listSpanByDrum[j]?.children[0].id, "span_active", Util.Pattern.getCurrentPatternArray(numero_page)[i][j]);
                }
            }
        }
    }, [currentPage, setCurrentPage, drums]);
}