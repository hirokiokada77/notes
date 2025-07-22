import { useAtomValue, useSetAtom } from "jotai";
import "./TabView.css";
import { faFile, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";
import {
	clearNoteAtom,
	clearSavedNoteAtom,
	forceRerenderAtom,
	initializeEditHistoryAtom,
	messagesAtom,
	noteThumbnailImageAtom,
	noteTitleAtom,
} from "../atoms";
import { StatusView } from "./StatusView";

export function TabView() {
	const tabViewListRef = useRef<HTMLUListElement | null>(null);

	const noteTitle = useAtomValue(noteTitleAtom);
	const thumbnailImage = useAtomValue(noteThumbnailImageAtom);
	const messages = useAtomValue(messagesAtom);
	const clearNote = useSetAtom(clearNoteAtom);
	const clearSavedNote = useSetAtom(clearSavedNoteAtom);
	const forceRerender = useSetAtom(forceRerenderAtom);
	const initializeEditHistory = useSetAtom(initializeEditHistoryAtom);

	const untitled = noteTitle === null;

	const resetScroll = () => {
		if (tabViewListRef.current) {
			tabViewListRef.current.scrollTo({ left: 0 });
		}
	};

	const createNote = () => {
		if (window.confirm(messages.clearConfirm)) {
			forceRerender();

			clearNote();
			clearSavedNote();
			initializeEditHistory("", null);

			globalThis.registerToastMessage("clearSuccess");

			resetScroll();
		}
	};

	const importNote = () => {
		alert("Not implemented");
	};

	return (
		<div className="tab-view">
			<ul className="tab-view-list" ref={tabViewListRef}>
				<li className="tab-view-status">
					<div className="tab-view-item-container">
						{thumbnailImage && (
							<div className="tab-view-item-icon">
								<img
									src={thumbnailImage.url}
									alt={thumbnailImage.alt}
									title={thumbnailImage.title}
								/>
							</div>
						)}

						<div className="tab-view-item-content">
							<div className="tab-view-item-title">
								{untitled ? (
									<span className="tab-view-item-title-untitled">Untitled</span>
								) : (
									<span title={noteTitle}>{noteTitle}</span>
								)}
							</div>

							<div className="tab-view-item-status">
								<StatusView />
							</div>
						</div>
					</div>
				</li>

				<li className="tab-view-action">
					<button
						className="tab-view-item-container"
						type="button"
						onClick={createNote}
						aria-label="Create new note in browser"
					>
						<div className="tab-view-item-icon">
							<FontAwesomeIcon icon={faPlus} />
						</div>

						<div className="tab-view-item-content">
							<div className="tab-view-item-title">New</div>

							<div className="tab-view-item-status">In browser</div>
						</div>
					</button>
				</li>

				<li className="tab-view-action">
					<button
						className="tab-view-item-container"
						type="button"
						onClick={importNote}
						aria-label="Import note from file"
					>
						<div className="tab-view-item-icon">
							<FontAwesomeIcon icon={faFile} />
						</div>

						<div className="tab-view-item-content">
							<div className="tab-view-item-title">Import</div>

							<div className="tab-view-item-status">From file</div>
						</div>
					</button>
				</li>
			</ul>
		</div>
	);
}
