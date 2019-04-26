{if $count.error>0}
<!DOCTYPE html>
<html>
	<head>
		<title>Une erreur est apparue</title>
		<script src="debugger/Debugger.js"></script>
		<link rel="stylesheet" href="debugger/Debugger.css">
	</head>
	<body>
{/if}
		<div id="debug"{if $count.error>0} class="fullscreen"{/if}>
			<div class="debug_bar">
				<div class="debug_global">
					<span class="debug_time">{$timeToGenerate} sec</span>
					<span class="debug_memory">{$memory.heapUsed}</span>
				</div>
				<div class="debug_control">
					<a class="debug_fullscreen"></a><a class="debug_toggle"></a><a class="debug_close"></a>
				</div>
			</div>
			<div class="debug_buttons">
				<div rel="trace" class="messages">
					<span>&nbsp;</span>Traces&nbsp; <span class="count">({$count.trace})</span>
				</div>
				<div rel="notice" class="messages">
					<span>&nbsp;</span>Notices <span class="count">({$count.notice})</span>
				</div>
				<div rel="warning" class="messages">
					<span>&nbsp;</span>Warnings <span class="count">({$count.warning})</span>
				</div>
				<div rel="error" class="messages">
					<span>&nbsp;</span>Erreurs & Exceptions <span class="count">({$count.error})</span>
				</div>
				<!--<div rel="query" class="messages">
					<span>&nbsp;</span>Requ&ecirc;tes SQL <span class="count">({$count.query})</span>
				</div>
				<div rel="cookie" class="vars disabled">
					cookie <span class="count">({$count.cookie})</span>
				</div>
				<div rel="session" class="vars disabled">
					session <span class="count">({$count.session})</span>
				</div>
				<div rel="post" class="vars disabled">
					post <span class="count">({$count.post})</span>
				</div>
				<div rel="get" class="vars">
					get <span class="count">({$count.get})</span>
				</div>-->
			</div>
			<div class="debug_content">
				<div class="debug_console">
					<table class="console" cellpadding="0" cellspacing="0">
						{$console}
					</table>
				</div>
			</div>
		</div>

{if $count.error>0}
	</body>
</html>
{/if}