﻿var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Group = function () {
	var id = Number(url.param("gid") || url.param("id", $("#ctl00_cphRoblox_AbuseReportButton_ReportAbuseTextHyperLink").attr("href")));
	if (!id) {
		console.warn("Could not parse group id.");
		return;
	}

	console.log("Group:", id);

	var shoutInput = $("#ctl00_cphRoblox_GroupStatusPane_StatusTextBox").attr("placeholder", "Enter group shout").attr("maxlength", "255").removeClass("default").removeAttr("value").removeAttr("onfocus");
	var shoutChar = function () { $("#ctl00_cphRoblox_GroupStatusPane_StatusSubmitButton").val("Shout (" + (255 - (shoutInput.val() || "").length) + ")"); };
	shoutInput.keyup(shoutChar).keydown(shoutChar).keypress(shoutChar).change(shoutChar).trigger("change");

	var postInput = $("#ctl00_cphRoblox_GroupWallPane_NewPost").attr("maxlength", "500");
	var postChar = function () { $("#ctl00_cphRoblox_GroupWallPane_NewPostButton").val("Post (" + (500 - (postInput.val() || "").length) + ")"); };
	postInput.keyup(postChar).keydown(postChar).keypress(postChar).change(postChar).trigger("change");

	storage.get(["groupShoutNotifierList", "groupShoutNotifier_mode", "groupRoleDisplay"], function (s) {
		s.groupShoutNotifierList = type(s.groupShoutNotifierList) == "object" ? s.groupShoutNotifierList : {};
		s.wl = s.groupShoutNotifier_mode != "whitelist";
		$(".GroupControlsBox").append($("<div>").append($("<button class=\"btn-control-medium btn-control" + (s.wl ? "-disabled" : "") + "\">").click(s.wl ? function () { } : function (e) {
			e.preventDefault();
			if (s.groupShoutNotifierList[id]) {
				delete s.groupShoutNotifierList[id];
				$(this).text("Shout Notifier: Off");
			} else {
				s.groupShoutNotifierList[id] = $(".GroupPanelContainer h2").text();
				$(this).text("Shout Notifier: On");
			}
			storage.set("groupShoutNotifierList", s.groupShoutNotifierList);
		}).prop("disabled", s.wl).text("Shout Notifier: O" + (s.groupShoutNotifierList[id] || s.wl ? "n" : "ff"))));

		if (s.groupRoleDisplay) {
			setInterval(function () {
				$(".GroupWall_PostDate:not([rplus])").attr("rplus", "").each(function () {
					var el = $(this);
					var userLink = el.find(".UserLink > a");
					if (userLink.length <= 0) {
						return;
					}
					var posterId = Roblox.users.getIdFromUrl(userLink.attr("href"));
					if (posterId > 0) {
						Roblox.groups.getUserRole(id, posterId).then(function (role) {
							el.prepend($("<span>").text(role.name), "<br/>");
						}).catch(function (e) {
							console.error(e);
						});
					}
				});
			}, 500);
		}
	});

	if (id == 650266) {
		setInterval(function () {
			$(".GroupWall_PostBtns:not([rplus])").attr("rplus", "").each(function () {
				var el = $(this);
				var poster = Roblox.users.getIdFromUrl(el.parent().find(".UserLink>a[href*='/users/']").attr("href"));
				if (poster && el.parent().parent().parent().find(".bcOverlay").length) {
					el.append($("<a>Trade</a>").css("margin-left", "3px").click(function (e) {
						Roblox.trades.openSettingBasedTradeWindow(poster).then(function () {
							console.log("opened trade window", poster);
						}, function (e) {
							console.error("failed to open trade window", e);
						});
						e.preventDefault();
					}));
				}
			}).find(">a[href^='javascript']").removeAttr("style");
		}, 250);
	} else if (id === 2518656) {
		$("#GroupsPeople_Clan").text("Update Log " + ext.manifest.version);

		var updateLogText = $("<pre id=\"updateLogText\">").text("Loading update log...");
		var updateLogPane = $("#GroupsPeoplePane_Clan").attr("rplus-update-log", +new Date);
		updateLogPane.html(updateLogText);

		RPlus.style.loadStylesheet(ext.getUrl("/css/pages/groups.css"));
		RPlus.settings.get().then(function (settings) {
			try {
				updateLogText.text(atob(settings.updateLogPost)).attr("rplus-linkify-ready", +new Date);
			} catch(e) {
				updateLogText.text("No update log to display right now.");
			}

			if (Roblox.users.authenticatedUserId === 48103520) {
				var editBox = $("<textarea id=\"updateLogEdit\">").val(updateLogText.text()).hide();
				updateLogText.after(editBox);
				updateLogPane.dblclick(function (e) {
					if (e.target !== updateLogPane[0]) {
						return;
					}

					if (updateLogText.is(":hidden")) {
						updateLogText.show();
						editBox.hide();
						RPlus.settings.set({ "updateLogPost": btoa(editBox.val()) }).then(function () {
							updateLogText.text(editBox.val()).attr("rplus-linkify-ready", +new Date);
						}).catch(function () {
							updateLogText.text("Failed to update update log.");
						});
					} else {
						updateLogText.hide();
						editBox.show();
					}
				});
			}
		}).catch(function (e) {
			console.error(e);
			updateLogText.html($("<b>").text("Failed to load update log. :("));
		});
	}

	return {};
};

RPlus.Pages.Group.patterns = [/^\/my\/groups\.aspx/i, /^\/groups\/group\.aspx/i];


// WebGL3D
